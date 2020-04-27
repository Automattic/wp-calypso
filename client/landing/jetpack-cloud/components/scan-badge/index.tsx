/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Badge from 'components/badge';

interface Props {
	numberOfThreatsFound: number;
	progress: number;
}

const ScanBadge: FunctionComponent< Props > = ( { numberOfThreatsFound, progress } ) => {
	const translate = useTranslate();
	if ( ! numberOfThreatsFound && ! progress ) {
		return null;
	}

	if ( progress ) {
		return (
			<Badge type="success">
				{ translate( '%(number)d %', {
					args: {
						number: progress,
					},
				} ) }
			</Badge>
		);
	}

	if ( numberOfThreatsFound ) {
		return (
			<Badge type="error">
				{ translate( '%(number)d threat', '%(number)d threats', {
					count: numberOfThreatsFound,
					args: {
						number: numberOfThreatsFound,
					},
				} ) }
			</Badge>
		);
	}

	return null;
};

export default ScanBadge;
