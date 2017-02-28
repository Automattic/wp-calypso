/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ExternalLink from 'components/external-link';
import SectionHeader from 'components/section-header';

export const WarningList = ( {
	translate,
	warnings,
} ) => {
	return (
		<div>
			<SectionHeader label={ translate(
				"By proceeding you'll lose %d feature:",
				"By proceeding you'll lose these %d features:",
				{
					count: warnings.length,
					args: warnings.length,
				}
			) } />
			<Card className="eligibility-warnings__warning-list">
				{ map( warnings, ( { name, description, supportUrl }, index ) =>
					<div className="eligibility-warnings__warning" key={ index }>
						<Gridicon icon="cross-small" size={ 24 } />
						<div className="eligibility-warnings__message">
							<span className="eligibility-warnings__message-title">
								{ name }
							</span>:&nbsp;
							<span className="eligibility-warnings__message-description">
								{ description }
							</span>
						</div>
						<div className="eligibility-warnings__action">
							<ExternalLink href={ supportUrl } target="_blank" rel="noopener noreferrer">
								<Gridicon icon="help-outline" size={ 24 } />
							</ExternalLink>
						</div>
					</div>
				) }
			</Card>
		</div>
	);
};

export default localize( WarningList );
