# -*- coding: utf-8 -*-
"""
Created on Sat Sep 17 10:34:38 2016

@author: Zeyi
Building a flagger using a decision tree
"""
import numpy as np
import pandas as pd
import sklearn as sk

"""
get_code()

Prints out conditional statements for decision tree

"""
def get_code(tree, feature_names):
        left      = tree.tree_.children_left
        right     = tree.tree_.children_right
        threshold = tree.tree_.threshold
        features  = [feature_names[i] for i in tree.tree_.feature]
        value = tree.tree_.value

        def recurse(left, right, threshold, features, node):
                if (left[node] != -1):
                        print "if ( " + features[node] + " <= " + str(threshold[node]) + " ) {"
                        if left[node] != -1:
                                recurse (left, right, threshold, features,left[node])
                        print "} else {"
                        if right[node] != -1:
                                recurse (left, right, threshold, features,right[node])
                        print "}"
                else:
                        print "return " + str(value[node])

        recurse(left, right, threshold, features, 0)
  
""" 
tranverse_tree()      

Combs through the decision tree, and gathers all thresholds that are '>' (right child).
Returns a np.array of size (1, len(features))

"""
def traverse_tree(feature, tree):
    feature_threshold = np.zeros(len(feature))
    threshold = tree.tree_.threshold
    feature_idx = tree.tree_.feature    
    left = tree.tree_.children_left
    right = tree.tree_.children_right
    
    def traverse(left, right, node, threshold, feature_idx):
        node_feature = feature_idx[node]
        node_thres = threshold[node]
        if (left[node] != -1): # There exist children
            if (feature[node_feature] <= node_thres): #Go left
                traverse(left, right, left[node], threshold, feature_idx)
            else: #Go right
                if node_thres > feature_threshold[node_feature]:
                    feature_threshold[node_feature] = node_thres
                traverse(left,right, right[node], threshold, feature_idx)
        
    traverse(left, right, 0, threshold, feature_idx)
    return feature_threshold

data_df = pd.read_csv("sample_dataset.csv")
X = data_df.iloc[:,2:2+11].values
labels = data_df.flag.values
features = list(data_df.columns.values[2:2+11])

from sklearn import tree

clf = tree.DecisionTreeClassifier()
clf = clf.fit(X,labels)

get_code(clf, features)
decision_X = np.apply_along_axis(traverse_tree, 1, X, clf)