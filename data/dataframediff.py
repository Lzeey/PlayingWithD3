# -*- coding: utf-8 -*-
"""
Created on Mon Sep 19 20:29:57 2016

@author: Zeyi
"""

import pandas as pd
import numpy as np

columns = ['col1','col2','col3']
df1 = pd.DataFrame(np.random.randint(0,high=10,size=300).reshape((100,3)), columns=columns)
df2 = pd.DataFrame(np.random.randint(0,high=5,size=300).reshape((100,3)), columns=columns)

df1 = df1.groupby(['col1','col2']).count()
df2 = df2.groupby(['col1','col2']).count()

idx1 = df1.index
idx2 = df2.index

diff_idx = idx1.difference(idx2)

tmp_df = pd.DataFrame(np.ones(len(diff_idx)),columns=['IsNew'], index=diff_idx)
df1_new = df1.join(tmp_df, how='left')
df1_new = df1_new.fillna(0)