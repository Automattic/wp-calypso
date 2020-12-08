/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';
import { isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import { ScreenReaderText } from '@automattic/components';
import Badge from 'calypso/components/badge';
import './style.scss';

interface Props {
	numberOfThreatsFound: number;
	progress?: number;
}

const ScanBadge: FunctionComponent< Props > = ( { numberOfThreatsFound, progress } ) => {
	const translate = useTranslate();
	if ( ! numberOfThreatsFound && ! isNumber( progress ) ) {
		return null;
	}

	if ( isNumber( progress ) ) {
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
		// We selectively hide the word "threats" based on screen width,
		// but it should always remain visible to screen readers
		return (
			<Badge type="error">
				<span aria-hidden="true">
					{ translate(
						'%(number)d {{span}}threat{{/span}}',
						'%(number)d {{span}}threats{{/span}}',
						{
							count: numberOfThreatsFound,
							args: {
								number: numberOfThreatsFound,
							},
							components: {
								span: <span className="scan-badge__words" />,
							},
						}
					) }
				</span>
				<ScreenReaderText>
					{ translate( '%(number)d threat', '%(number)d threats', {
						count: numberOfThreatsFound,
						args: {
							number: numberOfThreatsFound,
						},
					} ) }
				</ScreenReaderText>
			</Badge>
		);
	}

	return null;
};

export default ScanBadge;
