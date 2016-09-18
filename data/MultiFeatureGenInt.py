# -*- coding: utf-8 -*-
"""
Spyder Editor

This is a temporary script file.
"""
import numpy as np
import pandas as pd


numDays = 20
numSamples = 1000
population = 1500
numFeatures = 11;
userNums = np.random.choice(population,numSamples)
nameList = pd.Series(['User%d'%x for x in userNums])

dateList = pd.bdate_range(pd.datetime.today(), periods=numDays).strftime('%Y-%m-%d').tolist() #For csv file-names

featureList = ['f%d'%x for x in range(1,numFeatures+1)]
for x in dateList:
    #Use poisson distribution
    dataout = np.random.poisson(1, (numSamples,numFeatures))
    temp_df = pd.DataFrame(dataout,columns=featureList)
    temp_df['username'] = nameList
    #Write to csv
    temp_df.to_csv('Test%s.csv'%x, index=False, sep=',')
    
#Output a file that says the files to read
import json
with open('DataList.json','w') as f:
    a = json.dump(dateList,f)
