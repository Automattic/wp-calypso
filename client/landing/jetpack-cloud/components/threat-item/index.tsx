/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import classnames from 'classnames';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import LogItem from '../log-item';
import ThreatDescription from '../threat-description';
import ThreatItemHeader from 'landing/jetpack-cloud/components/threat-item-header';
import ThreatItemSubheader from 'landing/jetpack-cloud/components/threat-item-subheader';
import { Threat } from 'landing/jetpack-cloud/components/threat-item/types';
import { getThreatFix } from 'landing/jetpack-cloud/components/threat-item/utils';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	threat: Threat;
	isPlaceholder: boolean;
	onFixThreat?: Function;
	onIgnoreThreat?: Function;
	isFixing: boolean;
	contactSupportUrl?: string;
}

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
			return (
				<Button
					compact
					className={ classnames( 'threat-item__fix-button', className ) }
					onClick={ onFixThreat }
					disabled={ isFixing }
				>
					{ translate( 'Fix threat' ) }
				</Button>
			);
		},
		[ isFixing, onFixThreat ]
	);

	const getFix = React.useCallback( (): i18nCalypso.TranslateResult | undefined => {
		if ( threat.status === 'fixed' ) {
			return;
		}

		if ( ! threat.fixable ) {
			return translate(
				'Jetpack Scan cannot automatically fix this threat. Please {{link}}contact us{{/link}} for help.',
				{
					components: {
						link: <a href={ contactSupportUrl } rel="noopener noreferrer" target="_blank" />,
					},
				}
			);
		}

		return getThreatFix( threat.fixable );
	}, [ contactSupportUrl, threat ] );

	const isFixable = React.useMemo(
		() => threat.fixable && ( threat.status === 'current' || threat.status === 'ignored' ),
		[ threat ]
	);

	if ( isPlaceholder ) {
		return (
			<LogItem
				className={ classnames( 'threat-item', 'is-placeholder' ) }
				header="Placeholder threat"
				subheader="Placeholder sub header"
			></LogItem>
		);
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
			subheader={ <ThreatItemSubheader threat={ threat } /> }
			{ ...( isFixable
				? {
						summary: renderFixThreatButton( 'is-summary' ),
						expandedSummary: renderFixThreatButton( 'is-summary' ),
				  }
				: {} ) }
			{ ...( threat.status === 'current' ? { highlight: 'error' } : {} ) }
		>
			<ThreatDescription
				status={ threat.status }
				fix={ getFix() }
				problem={ threat.description }
				context={ threat.context }
				diff={ threat.diff }
				filename={ threat.filename }
			/>

			<div className="threat-item__buttons">
				{ isFixable && renderFixThreatButton( 'is-details' ) }
				{ threat.status === 'current' && (
					<Button
						scary
						compact
						className="threat-item__ignore-button"
						onClick={ onIgnoreThreat }
						disabled={ isFixing }
					>
						{ translate( 'Ignore threat' ) }
					</Button>
				) }
			</div>
		</LogItem>
	);
};

export default ThreatItem;
