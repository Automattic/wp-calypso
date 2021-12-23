import React from 'react';
import { ImportJob } from '../types';
import ContentChooser from './content-chooser';

import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	job?: ImportJob;
	siteId: number;
	siteSlug: string;
}

export const WordpressImporter: React.FunctionComponent< Props > = ( props ) => {
	return <ContentChooser { ...props } />;
};

export default WordpressImporter;
