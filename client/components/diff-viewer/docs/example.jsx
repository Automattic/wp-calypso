/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import DiffViewer from '../index';
import diff from './diff.json';

DiffViewer.displayName = 'DiffViewer';

const DiffViewerExample = () => <DiffViewer diff={ diff } />;

DiffViewerExample.displayName = 'DiffViewer';

export default DiffViewerExample;
