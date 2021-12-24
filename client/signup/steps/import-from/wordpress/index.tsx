import React from 'react';
import { ImportJob } from '../types';
import { ContentChooser } from './content-chooser';

import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	job?: ImportJob;
}

export const WordpressImporter: React.FunctionComponent< Props > = () => {
	return <ContentChooser />;
};

export default WordpressImporter;
