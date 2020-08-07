/**
 * External dependencies
 */
import * as React from 'react';
import classnames from 'classnames';
import { useI18n } from '@automattic/react-i18n';
import { sprintf } from '@wordpress/i18n';
import { useDebounce } from 'use-debounce';
import { Icon, wordpress } from '@wordpress/icons';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import DomainPickerButton from '../domain-picker-button';
import PlansButton from '../plans-button';
import { useCurrentStep, Step } from '../../path';
import { isEnabled } from '../../../../config';
import Link from '../link';

/**
 * Style dependencies
 */
import './style.scss';

const Header: React.FunctionComponent = () => {
	const { __, i18nLocale } = useI18n();
	const currentStep = useCurrentStep();

	const { domain, siteTitle } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );

	const [ domainSearch ] = useDebounce( siteTitle, 1000 /*ms*/ );

	const recommendedDomain = useSelect(
		( select ) => {
			if ( ! domainSearch || domainSearch.length < 2 ) {
				return;
			}
			return select( 'automattic/domains/suggestions' ).getDomainSuggestions( domainSearch, {
				// Avoid `only_wordpressdotcom` — it seems to fail to find results sometimes
				include_wordpressdotcom: false,
				include_dotblogsubdomain: false,
				quantity: 1, // this will give the recommended domain only
				locale: i18nLocale,
			} );
		},
		[ domainSearch ]
	)?.[ 0 ];

	const getDomainElementContent = () => {
		// If no site title entered (user skips intent gathering)
		// and no domain was selected, show "Pick a domain"
		if ( ! siteTitle && ! domain ) {
			return null;
		}

		if ( recommendedDomain && ! domain ) {
			/* translators: domain name is available, eg: "yourname.com is available" */
			return sprintf( __( '%s is available' ), recommendedDomain.domain_name );
		}

		return __( 'Choose a domain' );
	};

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	const domainElement = domain
		? domain.domain_name
		: getDomainElementContent() && (
				<span className="gutenboarding__header-domain-picker-button-domain">
					{ getDomainElementContent() }
				</span>
		  );

	const hideFullHeader = [
		'IntentGathering',
		'Domains',
		'DomainsModal',
		'Plans',
		'LanguageModal',
		'CreateSite',
	].includes( currentStep );

	// CreateSite step clears state before redirecting, don't show the default text in this case
	const siteTitleDefault = 'CreateSite' === currentStep ? '' : __( 'Start your website' );

	const changeLocaleButton = () => {
		if ( isEnabled( 'gutenboarding/language-picker' ) ) {
			return (
				<div className="gutenboarding__header-section-item gutenboarding__header-language-section">
					<Link to={ Step.LanguageModal }>
						<span>{ __( 'Site Language' ) } </span>
						<span className="gutenboarding__header-site-language-badge">{ i18nLocale }</span>
					</Link>
				</div>
			);
		}
		return null;
	};

	return (
		<div
			className="gutenboarding__header"
			role="region"
			aria-label={ __( 'Top bar' ) }
			tabIndex={ -1 }
		>
			<section
				className={ classnames( 'gutenboarding__header-section', {
					'gutenboarding__header-section--compact': hideFullHeader,
				} ) }
			>
				<div className="gutenboarding__header-section-item">
					<div className="gutenboarding__header-wp-logo">
						<Icon icon={ wordpress } size={ 28 } />
					</div>
				</div>
				<div className="gutenboarding__header-section-item gutenboarding__header-site-title-section">
					<div className="gutenboarding__header-site-title">
						{ siteTitle ? siteTitle : siteTitleDefault }
					</div>
				</div>
				<div className="gutenboarding__header-section-item gutenboarding__header-domain-section">
					{
						// We display the DomainPickerButton as soon as we have a domain suggestion,
						// unless we're still at the IntentGathering step. In that case, we only
						// show it comes from a site title (but hide it if it comes from a vertical).
						domainElement && (
							<div
								className={ classnames( 'gutenboarding__header-domain-picker-button-container', {
									'no-domain': ! domain,
								} ) }
							>
								<DomainPickerButton className="gutenboarding__header-domain-picker-button">
									{ domainElement }
								</DomainPickerButton>
							</div>
						)
					}
				</div>
				{ changeLocaleButton() }
				<div className="gutenboarding__header-section-item gutenboarding__header-plan-section gutenboarding__header-section-item--right">
					<PlansButton />
				</div>
			</section>
		</div>
	);
};

export default Header;
