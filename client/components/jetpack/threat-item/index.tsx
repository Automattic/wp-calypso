import { Button } from '@automattic/components';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import * as React from 'react';
import ExternalLinkWithTracking from 'calypso/components/external-link-with-tracking';
import {
	getThreatPayloadDescription,
	getThreatFix,
} from 'calypso/components/jetpack/threat-item/utils';
import ThreatItemHeader from 'calypso/components/jetpack/threat-item-header';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import LogItem from '../log-item';
import ThreatDescription from '../threat-description';
import type { Threat } from 'calypso/components/jetpack/threat-item/types';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';
interface Props {
	threat: Threat;
	isPlaceholder: boolean;
	onFixThreat?: () => void;
	onIgnoreThreat?: () => void;
	onUnignoreThreat?: () => void;
	isFixing: boolean;
	contactSupportUrl?: string;
}

export const ThreatItemPlaceholder: React.FC = () => (
	<LogItem
		className={ clsx( 'threat-item', 'is-placeholder' ) }
		header="Placeholder threat"
		subheader="Placeholder sub header"
	/>
);

const ThreatItem: React.FC< Props > = ( {
	threat,
	isPlaceholder,
	onFixThreat,
	onIgnoreThreat,
	onUnignoreThreat,
	isFixing,
} ) => {
	const dispatch = useDispatch();

	/**
	 * Render a CTA button. Currently, this button is rendered three
	 * times: in the details section, and in the `summary` and `extendSummary`
	 * sections of the header.
	 * @param {string} className A class for the button
	 */
	const renderFixThreatButton = React.useCallback(
		( className: string ) => {
			// Without this, clicking the [Fix threat] button will open the
			// entire ThreatItem element as well
			const onClickHandler = ( e: React.MouseEvent< HTMLElement > ) => {
				e.stopPropagation();
				onFixThreat && onFixThreat();
			};
			return (
				<Button
					primary
					className={ clsx( 'threat-item__fix-button', className ) }
					onClick={ onClickHandler }
					disabled={ isFixing }
				>
					{ translate( 'Fix threat' ) }
				</Button>
			);
		},
		[ isFixing, onFixThreat ]
	);

	const getFix = React.useCallback( (): TranslateResult | undefined => {
		if ( threat.status === 'fixed' ) {
			return;
		}

		if ( ! threat.fixable ) {
			return (
				<>
					{ ! threat.rows && (
						<p className="threat-item threat-description__section-text">
							{ translate(
								'Jetpack Scan cannot automatically fix this threat. We suggest that you resolve the threat manually: ' +
									'ensure that WordPress, your theme, and all of your plugins are up to date, and remove ' +
									'the offending code, theme, or plugin from your site.'
							) }
						</p>
					) }
					{ threat.rows && (
						<p className="threat-item threat-description__section-text">
							{ translate(
								'Jetpack Scan cannot automatically fix this threat. We suggest that you resolve the threat manually: ' +
									'ensure that WordPress, your theme, and all of your plugins are up to date, and remove or edit ' +
									'the offending post from your site.'
							) }
						</p>
					) }
					{ 'current' === threat.status && (
						<p className="threat-item threat-description__section-text">
							{ translate(
								'If you need more help to resolve this threat, we recommend {{strong}}Codeable{{/strong}}, a trusted freelancer marketplace of highly vetted WordPress experts. ' +
									'They have identified a select group of security experts to help with these projects. ' +
									'Pricing ranges from $70-120/hour, and you can get a free estimate with no obligation to hire.',
								{
									components: {
										strong: <strong />,
									},
								}
							) }
						</p>
					) }
				</>
			);
		}

		return (
			<>
				<p className="threat-item threat-description__section-text">
					{ translate(
						'Jetpack Scan is able to automatically fix this threat for you. Since it will replace the affected file or directory the site’s look-and-feel or features can be compromised. We recommend that you check if your latest backup was performed successfully in case a restore is needed.'
					) }
				</p>
				<p className="threat-item threat-description__section-text">
					{ getThreatFix( threat.fixable ) }
				</p>
			</>
		);
	}, [ threat ] );

	const isFixable = React.useMemo(
		() => threat.fixable && threat.status === 'current',
		[ threat ]
	);

	// We want to track which section are this toggles coming from
	const currentRoute = useSelector( getCurrentRoute );
	const currentRouteProp = React.useMemo( () => {
		return currentRoute
			? { section: currentRoute.includes( '/scan/history' ) ? 'History' : 'Scanner' }
			: {};
	}, [ currentRoute ] );
	const onOpenTrackEvent = React.useCallback(
		() =>
			dispatch(
				recordTracksEvent( 'calypso_jetpack_scan_threat_itemtoggle', {
					threat_signature: threat.signature,
					...currentRouteProp,
				} )
			),
		[ dispatch, threat, currentRouteProp ]
	);

	if ( isPlaceholder ) {
		return <ThreatItemPlaceholder />;
	}

	return (
		<LogItem
			key={ threat.id }
			className={ clsx( 'threat-item', {
				'is-fixed': threat.status === 'fixed',
				'is-ignored': threat.status === 'ignored',
				'is-current': threat.status === 'current',
			} ) }
			header={ <ThreatItemHeader threat={ threat } isStyled /> }
			clickableHeader
			onClick={ onOpenTrackEvent }
		>
			<ThreatDescription
				status={ threat.status }
				fix={ getFix() }
				problem={ threat.description }
				type={ getThreatPayloadDescription( threat ) }
				source={ threat.source }
				context={ threat.context }
				diff={ threat.diff }
				rows={ threat.rows }
				table={ threat.table }
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
				{ threat.status === 'ignored' && (
					<Button
						scary
						className="threat-item__unignore-button"
						onClick={ onUnignoreThreat }
						disabled={ isFixing }
					>
						{ translate( 'Unignore threat' ) }
					</Button>
				) }
				{ ! threat.fixable && 'current' === threat.status && (
					<ExternalLinkWithTracking
						className="button is-primary threat-item__codeable-button"
						href="https://codeable.io/partners/jetpack-scan/"
						target="_blank"
						tracksEventName="calypso_jetpack_scan_threat_codeable_estimate"
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
