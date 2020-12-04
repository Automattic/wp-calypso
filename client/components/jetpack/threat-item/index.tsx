/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { translate } from 'i18n-calypso';
import classnames from 'classnames';
import { Button } from '@automattic/components';
import { noop } from 'lodash';
import ExternalLinkWithTracking from 'calypso/components/external-link/with-tracking';

/**
 * Internal dependencies
 */
import LogItem from '../log-item';
import ThreatDescription from '../threat-description';
import ThreatItemHeader from 'calypso/components/jetpack/threat-item-header';
import ThreatItemSubheader from 'calypso/components/jetpack/threat-item-subheader';
import { Threat } from 'calypso/components/jetpack/threat-item/types';
import { getThreatFix } from 'calypso/components/jetpack/threat-item/utils';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	threat: Threat;
	isPlaceholder: boolean;
	onFixThreat?: ( threat: Threat ) => void;
	onIgnoreThreat?: () => void;
	isFixing: boolean;
	contactSupportUrl?: string;
}

export const ThreatItemPlaceholder: React.FC = () => (
	<LogItem
		className={ classnames( 'threat-item', 'is-placeholder' ) }
		header="Placeholder threat"
		subheader="Placeholder sub header"
	/>
);

const ThreatItem: React.FC< Props > = ( {
	threat,
	isPlaceholder,
	onFixThreat,
	onIgnoreThreat,
	isFixing,
	contactSupportUrl,
} ) => {
	/**
	 * Render a CTA button. Currently, this button is rendered three
	 * times: in the details section, and in the `summary` and `extendSummary`
	 * sections of the header.
	 *
	 * @param {string} className A class for the button
	 */
	const renderFixThreatButton = React.useCallback(
		( className: string ) => {
			// Without this, clicking the [Fix threat] button will open the
			// entire ThreatItem element as well
			const onClickHandler = ( e: React.MouseEvent< HTMLElement > ) => {
				e.stopPropagation();
				onFixThreat && onFixThreat( threat );
			};
			return (
				<Button
					primary
					className={ classnames( 'threat-item__fix-button', className ) }
					onClick={ onClickHandler }
					disabled={ isFixing }
				>
					{ translate( 'Fix threat' ) }
				</Button>
			);
		},
		[ isFixing, onFixThreat, threat ]
	);

	const getFix = React.useCallback( (): i18nCalypso.TranslateResult | undefined => {
		if ( threat.status === 'fixed' ) {
			return;
		}

		if ( ! threat.fixable ) {
			return (
				<>
					<p className="threat-description__section-text">
						{ translate(
							'Jetpack Scan cannot automatically fix this threat. We suggest that you resolve the threat manually: ' +
								'ensure that WordPress, your theme, and all of your plugins are up to date, and remove ' +
								'the offending code, theme, or plugin from your site.'
						) }
					</p>
					<p className="threat-description__section-text">
						{ translate(
							'If you need more help on resolving this threat, we recommend {{strong}}Codeable{{/strong}}, a WordPress freelancer marketplace of 530+ highly vetted security experts. ' +
								'Pricing ranges from $70-120/hour, and you can get a free estimate with no obligation to hire.',
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</p>
				</>
			);
		}

		return <p className="threat-description__section-text">{ getThreatFix( threat.fixable ) }</p>;
	}, [ contactSupportUrl, threat ] );

	const isFixable = React.useMemo(
		() => threat.fixable && ( threat.status === 'current' || threat.status === 'ignored' ),
		[ threat ]
	);

	// We want to track which section are this toggles coming from
	const currentRoute = useSelector( getCurrentRoute );
	const currentRouteProp = React.useMemo( () => {
		return currentRoute
			? { section: currentRoute.includes( '/scan/history' ) ? 'History' : 'Scanner' }
			: {};
	}, [ currentRoute ] );
	const onOpenTrackEvent = useTrackCallback( noop, 'calypso_jetpack_scan_threat_itemtoggle', {
		threat_signature: threat.signature,
		...currentRouteProp,
	} );

	if ( isPlaceholder ) {
		return <ThreatItemPlaceholder />;
	}

	return (
		<LogItem
			key={ threat.id }
			className={ classnames( 'threat-item', {
				'is-fixed': threat.status === 'fixed',
				'is-ignored': threat.status === 'ignored',
				'is-current': threat.status === 'current',
			} ) }
			header={ <ThreatItemHeader threat={ threat } isStyled={ true } /> }
			subheader={ <ThreatItemSubheader threat={ threat } isFixable={ isFixable } /> }
			{ ...( threat.status === 'current' ? { highlight: 'error' } : {} ) }
			clickableHeader={ true }
			onClick={ onOpenTrackEvent }
		>
			<ThreatDescription
				status={ threat.status }
				fix={ getFix() }
				problem={ threat.description }
				context={ threat.context }
				diff={ threat.diff }
				filename={ threat.filename }
				isFixable={ isFixable }
			/>

			<div className="threat-item__buttons">
				{ threat.status === 'current' && (
					<Button
						scary
						className="threat-item__ignore-button"
						onClick={ onIgnoreThreat }
						disabled={ isFixing }
					>
						{ translate( 'Ignore threat' ) }
					</Button>
				) }
				{ ! isFixable && (
					<ExternalLinkWithTracking
						className="button is-primary threat-item__codeable-button"
						href="https://codeable.io/partners/jetpack-scan/"
						target="_blank"
						rel="noopener noreferrer"
						tracksEventName="calypso_jetpack_scan_threat_codeable_estimate"
						onClick={ () => {} }
					>
						{ translate( 'Get a free estimate' ) }
					</ExternalLinkWithTracking>
				) }
				{ isFixable && renderFixThreatButton( 'is-details' ) }
			</div>
		</LogItem>
	);
};

export default ThreatItem;
