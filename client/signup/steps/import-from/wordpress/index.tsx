import { NextButton } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React from 'react';
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
	const { __ } = useI18n();

	return (
		<div className={ classnames( 'import-layout', 'importer-wrapper' ) }>
			<div className={ 'import-layout__column' }>
				<FormattedHeader
					align={ 'left' }
					headerText={ __( 'What would you like to import?' ) }
					subHeaderText={ __( 'Choose what you would like to import to your new site.' ) }
				/>
				<div className={ 'step-wrapper__header-image' }>
					<img alt="" src="/calypso/images/importer/onboarding-2.svg" />
				</div>
			</div>
			<div className={ 'import-layout__column' }>
				<div>
					<ActionCard
						classNames={ classnames( 'list__importer-option', { 'is-disabled': true } ) }
						headerText={ 'Everything' }
						mainText={ "Your site's content, themes, plugins, users and settings" }
					>
						<NextButton disabled>Continue</NextButton>
					</ActionCard>
					<SelectItems
						onSelect={ () => {
							// install jetpack
						} }
						items={ [
							{
								key: 'jetpack',
								title: 'Jetpack required',
								description:
									'You need to have Jetpack installed on your site to be able to import everything.',
								icon: jetpack,
								actionText: 'Install Jetpack',
								value: '',
							},
						] }
					/>
					<ActionCard
						classNames={ classnames( 'list__importer-option', { 'is-disabled': false } ) }
						headerText={ 'Content only' }
						mainText={ 'Import posts, pages, comments, and media.' }
					>
						<NextButton>Continue</NextButton>
					</ActionCard>
				</div>
			</div>
		</div>
	);
};

export default WordpressImporter;
