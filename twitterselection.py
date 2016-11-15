from pymongo import MongoClient
from flask import Flask
from flask_cors import CORS, cross_origin
import json
import codecs
import ast
from collections import Counter
from pymongo import MongoClient

import datetime
import indicoio
from bson import json_util

client =  MongoClient()
db = client.horizondb
data = db.twitter
hourS=9
hourE=12
month=1
pp=0
monday=1
tuesday=0
wednesday=0
thursday=0
friday=0
saturday=0
sunday=0
january =0
february=0
march =0
april=0
may=0
june =0
july=0
august=0
september=0
october =0
november=1
december=0
days= [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
months=[january, february, march, april, may, june, july, august, september, october, november, december]

barrios = []
def readFileBarrio():
	r = open("barrio_1.geojson", 'r')
	for index, line in enumerate(r):
		#print(line)
		polygon_coordinates = line.partition('"coordinates": ')[2].partition(' }')[0]
		#print(polygon_coordinates)
		#nombreBarrios.append(line.partition('"NOMB_BARR": ')[2].partition(', "')[0])
		barrios.append(polygon_coordinates)

barrios_publico = []
def readFilePublic():
	r = open("barrio_1_publico.geojson", 'r')
	for index, line in enumerate(r):
		#print(line)
		polygon_coordinates = line.partition('"coordinates": ')[2].partition(' }')[0]
		#print(polygon_coordinates)
		#nombreBarrios.append(line.partition('"NOMB_BARR": ')[2].partition(', "')[0])
		barrios_publico.append(polygon_coordinates)

# days = 1-7; months= 0-11
def dayselection ():
    w = codecs.open("selection.csv", 'w', 'utf-8')
    #w.write('id,usersid,followers,friends, text,lat,long,date')

    for index2,month in enumerate(months):
        if month==1:
            for index,day in enumerate(days):
                if day==1:
                    print("M" + str(index2) + ",d"+str(index))
                    result_db = selection_cursor(index+1,hourS, hourE, index2, pp)
                    for r in result_db:
                        lat = r["geometry"]["coordinates"][1]
                        long = r["geometry"]["coordinates"][0]
                        id = r["properties"]["t_id"]
                        usersid = r["properties"]["t_userId"]
                        followers = r["properties"]["t_follower"]
                        friends = r["properties"]["t_friends"]
                        text = '"' + r["properties"]["t_text"].replace('"',"'") + '"'
                        date = r["properties"]["t_createdA"]

                        w.write(str(id) + ',' + str(usersid) + ',' + str(followers) + ',' + str(friends) + ',' + str(text) + ',' + str(lat) + ',' + str(long) + ',' +str(date) + "\n")
    w.close()


def selection_cursor(day,hourS, hourE, month, pp):
    print({"properties.weekDay":day,"properties.month":month,"properties.hour":{"$gte": hourS, "$lt": hourE}})
    result_db = data.find({"properties.weekDay":int(day),"properties.month":int(month),"properties.hour":{"$gte": int(hourS), "$lt": int(hourE)}} )
    return result_db
#dayselection ()
#for element in result_db:
#    print(element["properties"]["t_text"])
app= Flask(__name__)
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"

@app.route("/")
def hello():
    return "Hello World"

@app.route("/datos/<day>/<hourS>/<hourE>/<month>/<pp>/<word>")
def selection(day,hourS, hourE, month, pp, word):
    str = word
    words = str.split(' ')
    arraySearch = []
    for w in words:
        arraySearch.append({"properties.t_text": {"$regex": ".*" + w + ".*"}})
        # wordcollection=wordcollection.find({"properties.t_text":{"$regex": ".*" + w + ".*"}})
    arraySearch.append({"properties.weekDay":int(day),"properties.month":int(month),"properties.hour":{"$gte": int(hourS), "$lt": int(hourE)}})
    result_db = data.find({"$and": arraySearch})
    print("selection")
    #result_db = data.find({"properties.weekDay":int(day),"properties.month":int(month),"properties.hour":{"$gte": int(hourS), "$lt": int(hourE)}} )
    print(result_db.count())
    result = []
    for r in result_db:
        lat = r["geometry"]["coordinates"][1]
        lng = r["geometry"]["coordinates"][0]
        result.append({"point": {"type": "Point", "coordinates": [lat, lng]}, "timeB": 0, "timeE": 0, "type": r["properties"]["pp"],
                       "value": r["properties"]["t_text"]})
    print("send selection response")
    return json.dumps(result)

@app.route("/text/<lat>/<lng>/<radius>/<circle>/<day>/<hourS>/<hourE>/<month>/<pp>/")
def selectionCircle(lat,lng, radius, circle, day,hourS, hourE, month, pp):
    print("selection")
    result_circle = data.find({"properties.weekDay":int(day),"properties.month":int(month),"properties.hour":{"$gte": int(hourS), "$lt": int(hourE)},"geometry.coordinates": {"$geoWithin": { "$center": [[float(lat),float(lng)] ,int(radius) ]}}})

    print(result_circle.count())
    analysis = []
    result = result_circle

    for res in result:
        sentence = (res["properties"]["t_text"])
        words = sentence.split()
        for word in words:
            analysis.append(word)

    c = Counter(analysis)
    d=[]
    for key,value in c.items():
        if value< 50 and value>10:
            d.append([key,value])
    return json.dumps(d)

def sentimentAnalysis():
    result_db_publico = data.find({}).limit(10)
    tweets = []
    for r in result_db_publico:
        tweets.append({"text": r["properties"]["t_text"], "id": str(r["_id"]), "query": "NO_QUERY", "language": "es"})
    
    
sentimentAnalysis()

@app.route("/researchword/<word>")
def  findword(word):
    str=word
    words=str.split(' ')
    arraySearch = []
    for w in words:
        arraySearch.append({"properties.t_text":{"$regex": ".*" + w + ".*"}})
        #wordcollection=wordcollection.find({"properties.t_text":{"$regex": ".*" + w + ".*"}})
    result = []
    wordcollection = data.find({"$and": arraySearch})
    for r in wordcollection:
        lat = r["geometry"]["coordinates"][1]
        lng = r["geometry"]["coordinates"][0]
        result.append({"point": {"type": "Point", "coordinates": [lat,lng]}, "timeB": 0, "timeE": 0, "type": r["properties"]["pp"], "value": r["properties"]["t_text"]})
    return json.dumps(result)
if __name__=="__main__":
    app.run()

