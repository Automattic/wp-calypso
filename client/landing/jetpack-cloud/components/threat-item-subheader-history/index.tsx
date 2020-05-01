/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import classnames from 'classnames';
import moment from 'moment';

/**
 * Internal dependencies
 */
import Badge from 'components/badge';
import { Threat } from 'landing/jetpack-cloud/components/threat-item/types';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	threat: Threat;
}

const entryActionClassNames = ( threat: Threat ) => {
	return {
		'is-fixed': threat.status === 'fixed',
		'is-ignored': threat.status === 'ignored',
	};
};

const formatDate = ( date: Date ) => {
	return moment( date ).format( 'LL' );
};

const ThreatSubHeaderHistory = ( { threat }: Props ) => {
	return (
		<>
			<div className="threat-item-subheader-history__subheader">
				<span className="threat-item-subheader-history__date">
					{ translate( 'Threat found on %s', {
						args: formatDate( threat.firstDetected ),
					} ) }
				</span>
				{ threat.fixedOn && (
					<span className="threat-item-subheader-history__date-separator"></span>
				) }
				{ threat.fixedOn && (
					<span
						className={ classnames(
							'threat-item-subheader-history__date',
							entryActionClassNames( threat )
						) }
					>
						{ translate( 'Threat %(action)s on %(fixedOn)s', {
							args: { action: threat.status, fixedOn: formatDate( threat.fixedOn ) },
						} ) }
					</span>
				) }
			</div>
			<Badge
				className={ classnames(
					'threat-item-subheader-history__badge',
					entryActionClassNames( threat )
				) }
			>
				<small>{ threat.status }</small>
			</Badge>
		</>
	);
};

export default ThreatSubHeaderHistory;
