/**
 * External dependencies
 */
import 'a8c-fse-common-data-stores';
import DomainPicker from '@automattic/domain-picker';
import { Modal } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import React from 'react';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */

// TODO: Should this come from a constant somewhere?
const DOMAIN_SUGGESTIONS_STORE = 'automattic/domains/suggestions';

type DomainSuggestion = import('@automattic/data-stores').DomainSuggestions.DomainSuggestion;

const DomainPickerModal: React.FunctionComponent = () => {
	// TODO: For now, domain modal shows immediately after editor loads.
	const [ isOpen, setIsOpen ] = React.useState< boolean >( true );

	const quantity = 10;

	const locale = useI18n().i18nLocale;

	// TODO: What's the flow ID for domain picker in FSE?
	const FLOW_ID = 'gutenboarding';

	// TODO: Move to store.
	const [ domainCategory, setDomainCategory ] = React.useState< string | undefined >( undefined );

	const domainCategories = useSelect( ( select ) =>
		select( DOMAIN_SUGGESTIONS_STORE ).getCategories()
	);

	// TODO: Move to store.
	const [ domainSearch, setDomainSearch ] = React.useState< string >( '' );

	// TODO: Where should this be taken from?
	const DOMAIN_SUGGESTION_VENDOR = 'variation4_front';

	// TODO: Extracted from useDomainSuggestions hook, this will be handled by domain picker later.
	const domainSuggestions = useSelect(
		( select ) => {
			if ( ! domainSearch ) {
				return;
			}
			return select( DOMAIN_SUGGESTIONS_STORE ).getDomainSuggestions( domainSearch, {
				// Avoid `only_wordpressdotcom` — it seems to fail to find results sometimes
				include_wordpressdotcom: true,
				include_dotblogsubdomain: false,
				quantity,
				locale,
				vendor: DOMAIN_SUGGESTION_VENDOR,
				category_slug: domainCategory,
			} );
		},
		[ domainSearch, domainCategory, quantity ]
	);

	// TODO: Move to store.
	const [ currentDomain, setCurrentDomain ] = React.useState< DomainSuggestion | undefined >();

	// TODO: How to trigger analytics here?
	const recordAnalytics = () => {};

	// TODO: How to get railcarId here?
	const [ railcarId, setRailcarId ] = React.useState< string | undefined >();

	React.useEffect( () => {
		// Only generate a railcarId when the domain suggestions change and are not empty.
		if ( domainSuggestions ) {
			setRailcarId( 'TODO' );
		}
	}, [ domainSuggestions, setRailcarId ] );

	const handleClose = () => {
		setIsOpen( false );
	};

	return (
		isOpen && (
			<Modal title="Test" onRequestClose={ handleClose }>
				<DomainPicker
					quantity={ quantity }
					analyticsFlowId={ FLOW_ID }
					domainSuggestions={ domainSuggestions }
					domainCategory={ domainCategory }
					domainCategories={ domainCategories }
					onSetDomainCategory={ setDomainCategory }
					domainSearch={ domainSearch }
					onSetDomainSearch={ setDomainSearch }
					showDomainConnectButton
					showDomainCategories
					currentDomain={ currentDomain }
					onDomainSelect={ setCurrentDomain }
					onClose={ handleClose }
					recordAnalytics={ recordAnalytics }
					railcarId={ railcarId }
					domainSuggestionVendor={ DOMAIN_SUGGESTION_VENDOR }
				/>
			</Modal>
		)
	);
};

export default DomainPickerModal;
