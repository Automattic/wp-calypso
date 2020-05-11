/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';
import { isNumber } from 'lodash';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import Badge from 'components/badge';
import { getSelectedSiteSlug } from 'state/ui/selectors';

interface Props {
	numberOfThreatsFound: number;
	progress?: number;
}

const ScanBadge: FunctionComponent< Props > = ( { numberOfThreatsFound, progress } ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	if ( ! numberOfThreatsFound && ! isNumber( progress ) ) {
		return null;
	}

	if ( isNumber( progress ) ) {
		return (
			<Badge type="success">
				<a href={ `/scan/${ siteSlug }` }>
					{ translate( '%(number)d %', {
						args: {
							number: progress,
						},
					} ) }
				</a>
			</Badge>
		);
	}

	if ( numberOfThreatsFound ) {
		return (
			<Badge type="error">
				<a href={ `/scan/${ siteSlug }` }>
					{ translate( '%(number)d threat', '%(number)d threats', {
						count: numberOfThreatsFound,
						args: {
							number: numberOfThreatsFound,
						},
					} ) }
				</a>
			</Badge>
		);
	}

	return null;
};

export default ScanBadge;
