import { DotcomPlans, getPlanNames } from '@automattic/api-core';
import { sshKeysQuery, userSettingsQuery } from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import SshKey from './ssh-key';
import SshKeyForm from './ssh-key-form';

export default function SecuritySshKey() {
	const { data: sshKeys } = useSuspenseQuery( sshKeysQuery() );
	const sshKey = sshKeys[ 0 ] ?? null;

	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const username = userSettings.user_login;

	const [ isEditing, setIsEditing ] = useState( false );

	let description = sshKey
		? createInterpolateElement(
				sprintf(
					/* translators: %(businessPlan)s is the name of the Business plan, %(commercePlan)s is the name of the Commerce plan */
					__(
						'Attach the SSH key to a site with a %(businessPlan)s or %(commercePlan)s plan to enable SSH key authentication for that site. If the SSH key is removed, it will also be removed from all attached sites. <learnMoreLink />'
					),
					{
						businessPlan: getPlanNames()[ DotcomPlans.BUSINESS ],
						commercePlan: getPlanNames()[ DotcomPlans.ECOMMERCE ],
					}
				),
				{
					learnMoreLink: (
						<InlineSupportLink
							supportPostId={ 100385 }
							supportLink={ localizeUrl(
								'https://developer.wordpress.com/docs/developer-tools/ssh/'
							) }
						/>
					),
				}
		  )
		: __(
				'Add an SSH key to your WordPress.com account to make it available for SFTP and SSH authentication.'
		  );

	if ( isEditing ) {
		description = __(
			'Replace your current SSH key with a new SSH key to use the new SSH key with all attached sites.'
		);
	}

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ isEditing ? __( 'Update SSH key' ) : __( 'SSH key' ) }
					description={ description }
				/>
			}
		>
			{ sshKey && ! isEditing ? (
				<SshKey sshKey={ sshKey } setIsEditing={ setIsEditing } username={ username } />
			) : (
				<SshKeyForm
					sshKey={ sshKey }
					isEditing={ isEditing }
					setIsEditing={ setIsEditing }
					username={ username }
				/>
			) }
		</PageLayout>
	);
}
