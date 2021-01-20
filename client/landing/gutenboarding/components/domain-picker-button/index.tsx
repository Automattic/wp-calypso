/**
 * External dependencies
 */
import * as React from 'react';
import classnames from 'classnames';
import { useSelect } from '@wordpress/data';
import { Icon, chevronDown } from '@wordpress/icons';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import { useLocale } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import Link from '../link';
import { usePath, Step } from '../../path';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { DOMAIN_SUGGESTIONS_STORE } from '../../stores/domain-suggestions';

/**
 * Style dependencies
 */
import './style.scss';

const DomainPickerButton: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const locale = useLocale();
	const makePath = usePath();
	const { domain, selectedDesign, siteTitle, siteVertical } = useSelect( ( select ) => ( {
		domain: select( ONBOARD_STORE ).getSelectedDomain(),
		selectedDesign: select( ONBOARD_STORE ).getSelectedDesign(),
		siteTitle: select( ONBOARD_STORE ).getSelectedSiteTitle(),
		siteVertical: select( ONBOARD_STORE ).getSelectedVertical(),
	} ) );

	// Use site title or vertical as search query for a domain suggestion
	const suggestionQuery = siteTitle || siteVertical?.label || '';
	const isValidQuery = suggestionQuery.length > 1;

	const domainSuggestion = useSelect(
		( select ) => {
			// Get suggestion only if the query is valid and if there isn't a selected domain
			if ( domain || ! isValidQuery ) {
				return null;
			}
			const domainSuggestions = select( DOMAIN_SUGGESTIONS_STORE ).getDomainSuggestions(
				suggestionQuery,
				{
					// Avoid `only_wordpressdotcom` — it seems to fail to find results sometimes
					include_wordpressdotcom: false,
					include_dotblogsubdomain: false,
					quantity: 1, // this will give the recommended domain only
					locale,
				}
			);
			return domainSuggestions?.[ 0 ] ?? null;
		},
		[ suggestionQuery, locale ]
	);

	const isLoadingSuggestion = ! domain && ! domainSuggestion && isValidQuery;

	// Show slide-in animation when a domain suggestion is loaded only if the user didn't interacted with Domain Picker
	const showAnimation = ! domain && ! selectedDesign && domainSuggestion;

	const getDomainElementContent = () => {
		if ( isLoadingSuggestion ) {
			return null;
		}
		if ( domain ) {
			return domain.domain_name;
		}
		if ( domainSuggestion ) {
			/* translators: domain name is available, eg: "yourname.com is available" */
			return sprintf( __( '%s is available' ), domainSuggestion.domain_name );
		}
		// If there is no selected domain and no site title / vertical, show a static button
		return __( 'Choose a domain' );
	};

	return (
		<div
			className={ classnames( 'domain-picker-button', {
				'domain-picker-button--has-first-content': showAnimation,
				'domain-picker-button--has-content': ! isLoadingSuggestion,
			} ) }
		>
			<Link to={ makePath( Step.DomainsModal ) }>
				<span className="domain-picker-button__label">{ getDomainElementContent() }</span>
				<Icon icon={ chevronDown } size={ 22 } />
			</Link>
		</div>
	);
};

export default DomainPickerButton;
