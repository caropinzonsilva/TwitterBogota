def splitFiles():
	documents = 20
	files = ['separated.geojson']

	for file in files:
		number = 1
		original = file
		r = open(original, 'r')
		modified = original.partition('.')[0] + '_' + str(number) + '.geojson' 
		print('mongoimport --db horizondb --collection builtUp --type json --file ' + modified + ' --jsonArray')
		w = open(modified, 'w')
		w.write('[')
		#last = r.readlines()[-1]
		#print(last)
		#all lines except last one
		for index, line in enumerate(r):
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
				print('mongoimport --db horizondb --collection builtUp --type json --file ' + modified + ' --jsonArray')
				w = open(modified, 'w')
				w.write('[')
		w.write(']')
		w.close()
		r.close()
splitFiles()