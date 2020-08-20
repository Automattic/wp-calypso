/**
 * External dependencies
 */
import * as React from 'react';
import { useI18n } from '@automattic/react-i18n';
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

	const { siteTitle } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );

	// steps (including modals) where we show Domains button
	const showDomainsButton = [
		'DesignSelection',
		'Style',
		'Features',
		'Plans',
		'PlansModal',
	].includes( currentStep );

	// steps (including modals) where we show Plans button
	const showPlansButton = [ 'DesignSelection', 'Style', 'Features' ].includes( currentStep );

	// CreateSite step clears state before redirecting, don't show the default text in this case
	const siteTitleDefault = 'CreateSite' === currentStep ? '' : __( 'Start your website' );

	/* eslint-disable wpcalypso/jsx-classname-namespace */

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
			<section className="gutenboarding__header-section">
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
					{ showDomainsButton && <DomainPickerButton /> }
				</div>
				{ changeLocaleButton() }
				<div className="gutenboarding__header-section-item gutenboarding__header-plan-section gutenboarding__header-section-item--right">
					{ showPlansButton && <PlansButton /> }
				</div>
			</section>
		</div>
	);
};

export default Header;
