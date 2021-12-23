import { NextButton } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React from 'react';
import { ImportJob } from '../types';
import { ContentChooser } from './content-chooser';
import ActionCard from 'calypso/components/action-card';
import FormattedHeader from 'calypso/components/formatted-header';
import { jetpack } from '../../../icons';
import SelectItems from '../../../select-items';
import { ImportJob } from '../types';

import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	job?: ImportJob;
}

export const WordpressImporter: React.FunctionComponent< Props > = () => {
	return <ContentChooser />;
};

export default WordpressImporter;
