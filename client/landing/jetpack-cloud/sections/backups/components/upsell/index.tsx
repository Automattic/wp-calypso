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
					'Make a mistake or two. {{span1}}Experiment{{/span1}}. With {{a}}Jetpack Backup{{/a}} you can revert changes or restore an earlier version of your site if you need to. No {{span2}}ifs{{/span2}}, {{span3}}ands{{/span3}}, or {{span4}}uh-ohs{{/span4}} about it.',
					{
						components: {
							a: (
								<a
									href="https://jetpack.com/upgrade/backup/"
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
							span1: <span />,
							span2: <span />,
							span3: <span />,
							span4: <span />,
						},
					}
				) }
			</p>
			<Button href={ `https://wordpress.com/plans/${ siteSlug }` } primary>
				{ translate( 'Upgrade' ) }
			</Button>
		</div>
	);
};

export default JetpackCloudBackupUpsell;
