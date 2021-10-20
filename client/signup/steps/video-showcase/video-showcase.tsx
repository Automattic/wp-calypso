import { Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import { localize, LocalizeProps } from 'i18n-calypso';
import React from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import { tip } from './icons';
import type { SiteOptionsFormValues } from './types';
import './video-showcase.scss';

interface Props {
	// 	defaultSiteTitle: string;
	// 	defaultTagline: string;
	// 	onSubmit: ( siteOptionsFormValues: SiteOptionsFormValues ) => void;
	translate: LocalizeProps[ 'translate' ];
}

const VideoShowcase: React.FC< Props > = ( { translate } ) => {
	// const [ formValues, setFormValues ] = React.useState( {
	// 	siteTitle: defaultSiteTitle,
	// 	tagline: defaultTagline,
	// } );

	// const onChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
	// 	setFormValues( ( value ) => ( {
	// 		...value,
	// 		[ event.target.name ]: event.target.value,
	// 	} ) );
	// };

	// const handleSubmit = ( event: React.FormEvent ) => {
	// 	event.preventDefault();
	// 	onSubmit( formValues );
	// };

	const headerText = translate( 'Watch five videos.' );
	const subHeaderText = translate( 'Save yourself hours.' );

	return (
		<>
			<div className="video-showcase__header">
				<FormattedHeader
					id={ 'step-header' }
					headerText={ headerText }
					subHeaderText={ subHeaderText }
					align={ 'left' }
				/>
				<div className="video-showcase__header-text"></div>
			</div>
			<div className="video-showcase__content">
				<p> this is the content</p>
			</div>
		</>
	);
};

export default localize( VideoShowcase );
