import datetime
def splitFiles():
	documents = 100000
	files = ['02_geojson_pp.geojson']

	for file in files:
		number = 1
		original = file
		r = open(original, 'r')
		modified = original.partition('.')[0] + '_' + str(number) + '.geojson' 
		print('mongoimport --db horizondb --collection twitter --type json --file ' + modified + ' --jsonArray')
		w = open(modified, 'w')
		w.write('[')
		#last = r.readlines()[-1]
		#print(last)
		#all lines except last one
		for index, line in enumerate(r):
			date = line.partition('"t_createdA": "')[2].partition('"')[0].partition(" +0000 ")[0] + " " + line.partition('"t_createdA": "')[2].partition('"')[0].partition(" +0000 ")[2]
			year = datetime.datetime.strptime(date, "%a %b %d %H:%M:%S %Y").date()
			finalDate = year.strftime("%Y-%m-%dT") + date[11:19]
			line = line.partition('"t_createdA": "')[0] + '"t_createdA": {$date:"' + finalDate + 'Z"}, "pp": ' + line.partition('"t_createdA": "')[2].partition(' "pp": ')[2]
			#print(line)
			#print(year.strftime("%Y-%m-%dT%H:%M:%S"))
			if index < documents*number:
				w.write(line)
			else:
				#remove last coma
				line = line[:-2]
				w.write(line)
				w.write(']')
				w.close()
				number = number + 1
				modified = original.partition('.')[0] + '_' + str(number) + '.geojson' 
				print('mongoimport --db horizondb --collection twitter --type json --file ' + modified + ' --jsonArray')
				w = open(modified, 'w')
				w.write('[')
		w.write(']')
		w.close()
		r.close()
splitFiles()