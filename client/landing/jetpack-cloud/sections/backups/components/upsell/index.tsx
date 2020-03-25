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

interface Props {}

const JetpackCloudBackupUpsell: FunctionComponent< Props > = () => {
	const translate = useTranslate();

	return (
		<div className="upsell">
			<div className="upsell__header">
				<Gridicon icon="cloud-upload" size={ 72 } />
			</div>
			<h3 className="upsell__title">{ translate( 'Go ahead, try something new' ) }</h3>
			<p className="upsell__copy">
				{ translate(
					'Make a mistake or two. Experiment. With {{a}}Jetpack Backup{{/a}} you can revert changes or restore an earlier version of your site if you need to. No ifs, ands, or uh-ohs about it.',
					{
						components: {
							a: (
								<a
									href="https://jetpack.com/upgrade/backup/"
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
				) }
			</p>
			<Button href={ `https://wordpress.com/plans` } primary>
				{ translate( 'Upgrade' ) }
			</Button>
		</div>
	);
};

export default JetpackCloudBackupUpsell;
