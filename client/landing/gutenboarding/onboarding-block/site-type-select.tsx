/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { __ as NO__ } from '@wordpress/i18n';
import React from 'react';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../store';
import { SiteType } from '../store/types';

interface Props {
	onSelect: () => void;
}

export const siteTypeOptions: Record< SiteType, string > = {
	[ SiteType.BLOG ]: NO__( 'with a blog' ),
	[ SiteType.BUSINESS ]: NO__( 'for a business' ),
	[ SiteType.PORTFOLIO ]: NO__( 'to share a portfolio' ),
	[ SiteType.STORE ]: NO__( 'for a store' ),
};

export default function SiteTypeSelect( { onSelect }: Props ) {
	const { siteType } = useSelect( select => select( STORE_KEY ).getState() );
	const { setSiteType } = useDispatch( STORE_KEY );

	const selectSiteType = e => {
		setSiteType( e.target.value as SiteType );
		onSelect();
	};

	return (
		<ul className="onboarding-block__multi-question">
			{ map( siteTypeOptions, ( label, value ) => (
				<li key={ value } className={ value === siteType ? 'selected' : '' }>
					<label>
						<input
							name="onboarding_site_type"
							onChange={ selectSiteType }
							type="radio"
							value={ value }
						/>
						<span className="onboarding-block__multi-question-choice">{ label }</span>
					</label>
				</li>
			) ) }
		</ul>
	);
}
