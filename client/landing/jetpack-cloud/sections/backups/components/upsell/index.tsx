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
		<div>
			<Gridicon icon="cloud-download" />
			<h3>{ translate( 'Go ahead, try something new' ) }</h3>
			<p>
				{ translate(
					'Make a mistake or two. Experiment. With {{strong}}Jetpack Backup{{/strong}}, you can revert changes or restore an earlier version of your site if you need to. No ifs, ands, or uh-ohs about it.',
					{
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<Button>{ translate( 'Upgrade' ) }</Button>
		</div>
	);
};

export default JetpackCloudBackupUpsell;
