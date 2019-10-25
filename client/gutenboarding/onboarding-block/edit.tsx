/**
 * External dependencies
 */
import { sprintf, __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';
import { BlockEditProps } from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';
import React from 'react';

/**
 * Internal dependencies
 */
import { SiteType } from '.';
import { STORE_KEY } from '../store';

export default function OnboardingEdit() {
	const siteType = useSelect( select => select( STORE_KEY ).getSiteType() );
	const { setSiteType } = useDispatch( STORE_KEY );

	if ( true || ! siteType ) {
		return (
			<>
				<h1>{ __( "Let's set up your website -- it takes only a moment" ) }</h1>
				{ __( 'I want to create a website ' ) }
				<SelectControl< SiteType >
					onChange={ setSiteType }
					options={ [
						{ label: __( 'with a blog.' ), value: SiteType.BLOG },
						{ label: __( 'for a store.' ), value: SiteType.STORE },
						{ label: __( 'to write a story.' ), value: SiteType.STORY },
					] }
					value={ siteType || SiteType.BLOG }
				/>
			</>
		);
	}
	return <div>{ sprintf( __( 'Cool, you have a %s' ), siteType ) }</div>;
}
