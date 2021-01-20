/**
 * External dependencies
 */
import * as React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { Icon, wordpress } from '@wordpress/icons';
import { useSelect } from '@wordpress/data';
import { Button } from '@wordpress/components';
import { useLocale } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import DomainPickerButton from '../domain-picker-button';
import PlansButton from '../plans-button';
import { useCurrentStep, useIsAnchorFm, usePath, Step } from '../../path';
import { isEnabled } from '../../../../config';
import Link from '../link';

/**
 * Style dependencies
 */
import './style.scss';

const Header: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const locale = useLocale();
	const currentStep = useCurrentStep();
	const isAnchorFmSignup = useIsAnchorFm();
	const makePath = usePath();

	const siteTitle = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedSiteTitle() );

	// steps (including modals) where we show Domains button
	const showDomainsButton =
		[ 'DesignSelection', 'Style', 'Features', 'Plans', 'PlansModal' ].includes( currentStep ) &&
		! isAnchorFmSignup;

	// steps (including modals) where we show Plans button
	const showPlansButton =
		[ 'DesignSelection', 'Style', 'Features' ].includes( currentStep ) && ! isAnchorFmSignup;

	// locale button is hidden on AnchorFM flavored gutenboarding
	const showLocaleButton = ! isAnchorFmSignup;

	// CreateSite step clears state before redirecting, don't show the default text in this case
	const siteTitleDefault = 'CreateSite' === currentStep ? '' : __( 'Start your website' );

	const homeLink = '/';

	/* eslint-disable wpcalypso/jsx-classname-namespace */

	const changeLocaleButton = () => {
		if ( isEnabled( 'gutenboarding/language-picker' ) ) {
			return (
				<div className="gutenboarding__header-section-item gutenboarding__header-language-section">
					<Link to={ makePath( Step.LanguageModal ) }>
						<span>{ __( 'Site Language' ) } </span>
						<span className="gutenboarding__header-site-language-badge">{ locale }</span>
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
			<section className="gutenboarding__header-section">
				<div className="gutenboarding__header-section-item gutenboarding__header-section-item--wp-logo">
					<Button href={ homeLink }>
						<div className="gutenboarding__header-wp-logo">
							<Icon icon={ wordpress } size={ 28 } />
						</div>
					</Button>
				</div>
				<div className="gutenboarding__header-section-item gutenboarding__header-site-title-section">
					<div className="gutenboarding__header-site-title">
						{ siteTitle ? siteTitle : siteTitleDefault }
					</div>
				</div>
				<div className="gutenboarding__header-section-item gutenboarding__header-domain-section">
					{ showDomainsButton && <DomainPickerButton /> }
				</div>
				{ showLocaleButton && changeLocaleButton() }
				<div className="gutenboarding__header-section-item gutenboarding__header-plan-section gutenboarding__header-section-item--right">
					{ showPlansButton && <PlansButton /> }
				</div>
			</section>
		</div>
	);
};

export default Header;
