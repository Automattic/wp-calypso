import { useLocale } from '@automattic/i18n-utils';
import { useSelect } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';
import { Icon, chevronDown } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { usePath, Step } from '../../path';
import { DOMAIN_SUGGESTIONS_STORE } from '../../stores/domain-suggestions';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import Link from '../link';
import type { FunctionComponent } from 'react';

import './style.scss';

const DomainPickerButton: FunctionComponent = () => {
	const { __ } = useI18n();
	const locale = useLocale();
	const makePath = usePath();
	const { domain, selectedDesign, siteTitle } = useSelect( ( select ) =>
		select( ONBOARD_STORE ).getState()
	);

	// Use site title as search query for a domain suggestion
	const suggestionQuery = siteTitle || '';
	const isValidQuery = suggestionQuery.length > 1;

	const domainSuggestion = useSelect(
		( select ) => {
			// Get suggestion only if the query is valid and if there isn't a selected domain
			if ( domain || ! isValidQuery ) {
				return;
			}
			return select( DOMAIN_SUGGESTIONS_STORE ).getDomainSuggestions( suggestionQuery, {
				// Avoid `only_wordpressdotcom` — it seems to fail to find results sometimes
				include_wordpressdotcom: false,
				include_dotblogsubdomain: false,
				quantity: 1, // this will give the recommended domain only
				locale,
			} );
		},
		[ suggestionQuery ]
	)?.[ 0 ];

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
		// If there is no selected domain and no site title, show a static button
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
