# -*- coding: utf-8 -*-
"""
Spyder Editor

This is a temporary script file.
"""
import numpy as np
import pandas as pd

mu = np.array([[0, 0],[2, 3],[-1, 2]])
sigma = np.zeros((2,2,3))

sigma[:,:,0] = [[1,1.5],[1.5,3]]
sigma[:,:,1] = [[2,0],[0,4]]
sigma[:,:,2] = [[1,-0.9],[-0.9,1.5]]

numDays = 10
numSamples = 400
nameList = pd.Series(['User%d'%x for x in range(numSamples)])

for x in range(numDays):
    dataout = np.array([]).reshape(numSamples,0)
    for i in range(3):
        dataout = np.hstack((dataout,np.random.multivariate_normal(mu[i,:],sigma[:,:,i],400)))
    temp_df = pd.DataFrame(dataout,columns=['x1','y1','x2','y2','x3','y3'])
    temp_df['username'] = nameList
    #Write to csv
    temp_df.to_csv('DataDay%d.csv'%x, index=False, sep='\t')