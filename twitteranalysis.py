from pymongo import MongoClient
from flask import Flask
from flask_cors import CORS, cross_origin
import json

client =  MongoClient()
db = client.local
data = db.twitterBogota
d=data.find({"properties.t_createdA":"Fri Nov 07 00:00:02 +0000 2014"})
print(d[0]["properties"]["t_createdA"])

app= Flask(__name__)
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"

@app.route("/")
def hello():
    return "Hello World"

@app.route("/datos")
def halo():
    lat = d["location"]["coordinates"][1]
    lon = d["location"]["coordinates"][0]
    return

if __name__=="__main__":
    app.run()