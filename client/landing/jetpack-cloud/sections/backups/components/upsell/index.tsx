/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Gridicon from 'components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	siteSlug: string;
}

const JetpackCloudBackupUpsell: FunctionComponent< Props > = ( { siteSlug } ) => {
	const translate = useTranslate();

	return (
		<div className="upsell">
			<div className="upsell__header">
				<Gridicon icon="cloud-upload" size={ 72 } />
			</div>
			<h3 className="upsell__title">{ translate( 'Go ahead, try something new' ) }</h3>
			<p className="upsell__copy">
				{ translate(
					'Make a mistake or two. {{span}}Experiment{{/span}}. With {{a}}Jetpack Backup{{/a}} you can revert changes or restore an earlier version of your site if you need to. No {{span}}ifs{{/span}}, {{span}}ands{{/span}}, or {{span}}uh-ohs{{/span}} about it.',
					{
						components: {
							a: (
								<a
									href="https://jetpack.com/upgrade/backup/"
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
							span: <span />,
						},
					}
				) }
			</p>
			<Button
				className="upsell__upgrade-button"
				href={ `https://jetpack.com/upgrade/backup/?site=${ siteSlug }` }
				primary
			>
				{ translate( 'Upgrade' ) }
			</Button>
		</div>
	);
};

export default JetpackCloudBackupUpsell;
