import {
	BlogNotificationSettings,
	DeviceNotificationSettings,
	type NotificationSettings,
} from '@automattic/api-core';
import {
	userNotificationsSettingsQuery,
	userNotificationsDevicesQuery,
	userNotificationsSettingsMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
	TabPanel,
	__experimentalVStack as VStack,
	SelectControl,
	__experimentalHStack as HStack,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import './index.scss';
import { useMemo, useState } from 'react';
import { SettingsOption, SettingsPanel } from '../../../../components/settings-panel';

interface Props {
	className?: string;
	blogId: number;
}

const translationSettings = {
	comment_like: __( 'Likes on my comments' ),
	recommended_blog: __( 'Blog recommendations' ),
	new_comment: __( 'Comments on my site' ),
	post_like: __( 'Likes on my posts' ),
	follow: __( 'Subscriptions' ),
	achievement: __( 'Site achievements' ),
	mentions: __( 'Username mentions' ),
	scheduled_publicize: __( 'Jetpack Social' ),
	blogging_prompt: __( 'Daily writing prompts' ),
	draft_post_prompt: __( 'Draft post reminders' ),
	store_order: __( 'New order' ),
	comment_reply: __( 'Replies to my comments' ),
};

const TimelineSettings = ( { blogId }: { blogId: number } ) => {
	const { data } = useQuery( userNotificationsSettingsQuery() );
	const { mutate: updateSettings, isPending: isUpdating } = useMutation(
		userNotificationsSettingsMutation()
	);
	const blogSettings = data?.blogs.find( ( blog ) => blog.blog_id === blogId );
	const settings = blogSettings?.timeline ?? null;

	const handleChange = ( updated: SettingsOption ) => {
		updateSettings( {
			data: {
				blogs: [
					{
						blog_id: blogId,
						timeline: { ...settings, [ updated.id ]: updated.value },
					},
				],
			},
		} );
	};

	const handleApplyAll = () => {
		if ( ! blogSettings ) {
			return;
		}

		updateSettings( {
			data: {
				blogs: [ blogSettings ],
			},
			applyToAll: true,
		} );
	};

	const options = useMemo(
		() => [
			{
				id: 'new_comment',
				label: translationSettings.new_comment,
				value: settings?.new_comment ?? false,
			},
			{
				id: 'comment_like',
				label: translationSettings.comment_like,
				value: settings?.comment_like ?? false,
			},
			{
				id: 'post_like',
				label: translationSettings.post_like,
				value: settings?.post_like ?? false,
			},
			{
				id: 'recommended_blog',
				label: translationSettings.recommended_blog,
				value: settings?.recommended_blog ?? false,
			},
			{
				id: 'follow',
				label: translationSettings.follow,
				value: settings?.follow ?? false,
			},
			{
				id: 'achievement',
				label: translationSettings.achievement,
				value: settings?.achievement ?? false,
			},
			{
				id: 'mentions',
				label: translationSettings.mentions,
				value: settings?.mentions ?? false,
			},
			{
				id: 'scheduled_publicize',
				label: translationSettings.scheduled_publicize,
				value: settings?.scheduled_publicize ?? false,
			},
			{
				id: 'blogging_prompt',
				label: translationSettings.blogging_prompt,
				value: settings?.blogging_prompt ?? false,
			},
		],
		[ settings ]
	);

	if ( ! settings ) {
		return null;
	}

	return (
		<VStack spacing={ 4 } alignment="start">
			<SettingsPanel options={ options } onChange={ handleChange } disabled={ isUpdating } />;
			<Button onClick={ handleApplyAll } variant="primary">
				{ __( 'Apply to all sites' ) }
			</Button>
		</VStack>
	);
};

const EmailSettings = ( { blogId }: { blogId: number } ) => {
	const { data: originalSettings } = useSuspenseQuery( {
		...userNotificationsSettingsQuery(),
	} );

	const { mutate: updateSettings, isPending: isUpdating } = useMutation( {
		...userNotificationsSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'Settings saved successfully.' ),
				error: __( 'There was a problem saving your changes. Please, try again.' ),
			},
		},
	} );

	const blogSettings = originalSettings.blogs.find( ( blog ) => blog.blog_id === blogId );
	const settings = blogSettings?.email ?? null;

	const handleChange = ( updated: SettingsOption ) => {
		updateSettings( {
			data: {
				blogs: [ { blog_id: blogId, email: { ...settings, [ updated.id ]: updated.value } } ],
			},
		} );
	};
	const handleApplyAll = () => {
		if ( ! blogSettings ) {
			return;
		}

		updateSettings( {
			data: {
				blogs: [ blogSettings ],
			},
			applyToAll: true,
		} );
	};

	const options = useMemo(
		() => [
			{
				id: 'new_comment',
				label: translationSettings.new_comment,
				value: settings?.new_comment ?? false,
			},
			{
				id: 'comment_like',
				label: translationSettings.comment_like,
				value: settings?.comment_like ?? false,
			},
			{
				id: 'post_like',
				label: translationSettings.post_like,
				value: settings?.post_like ?? false,
			},
			{
				id: 'recommended_blog',
				label: translationSettings.recommended_blog,
				value: settings?.recommended_blog ?? false,
			},
			{
				id: 'follow',
				label: translationSettings.follow,
				value: settings?.follow ?? false,
			},
			{
				id: 'mentions',
				label: __( 'Username mentions' ),
				value: settings?.mentions ?? false,
			},
			{
				id: 'blogging_prompt',
				label: __( 'Daily writing prompts' ),
				value: settings?.blogging_prompt ?? false,
			},
			{
				id: 'draft_post_prompt',
				label: __( 'Draft post reminders' ),
				value: settings?.draft_post_prompt ?? false,
			},
		],
		[ settings ]
	);

	if ( ! settings ) {
		return null;
	}

	return (
		<VStack spacing={ 4 } alignment="start">
			<SettingsPanel disabled={ isUpdating } options={ options } onChange={ handleChange } />
			<Button onClick={ handleApplyAll } variant="primary" isBusy={ isUpdating }>
				{ __( 'Apply to all sites' ) }
			</Button>
		</VStack>
	);
};

const DevicesSettings = ( { blogId }: { blogId: number } ) => {
	const { data } = useQuery( userNotificationsSettingsQuery() );
	const { data: devices } = useSuspenseQuery( userNotificationsDevicesQuery() );
	const { mutate: updateSettings, isPending: isUpdating } = useMutation( {
		...userNotificationsSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'Settings saved successfully.' ),
				error: __( 'There was a problem saving your changes. Please, try again.' ),
			},
		},
	} );

	const [ selectedDeviceId, setSelectedDeviceId ] = useState< string | undefined >(
		devices?.[ 0 ]?.device_id
	);
	const blogSettings = data?.blogs.find( ( blog ) => blog.blog_id === blogId );
	const settings = blogSettings?.devices?.find(
		( device ) => device.device_id.toString() === selectedDeviceId
	);

	const handleDeviceChange = ( deviceId: string ) => {
		setSelectedDeviceId( deviceId );
	};

	const handleChange = ( item: SettingsOption ) => {
		updateSettings( {
			data: {
				blogs: [
					{
						blog_id: blogId,
						devices: [ { ...settings, [ item.id ]: item.value } as DeviceNotificationSettings ],
					},
				],
			},
		} );
	};

	const options = useMemo(
		() => [
			{
				id: 'new_comment',
				label: translationSettings.new_comment,
				value: settings?.new_comment ?? false,
			},
			{
				id: 'comment_like',
				label: translationSettings.comment_like,
				value: settings?.comment_like ?? false,
			},

			{
				id: 'post_like',
				label: translationSettings.post_like,
				value: settings?.post_like ?? false,
			},

			{
				id: 'follow',
				label: __( 'Subscriptions' ),
				value: settings?.follow ?? false,
			},

			{
				id: 'achievement',
				label: __( 'Site achievements' ),
				value: settings?.achievement ?? false,
			},

			{
				id: 'mentions',
				label: __( 'Username mentions' ),
				value: settings?.mentions ?? false,
			},

			{
				id: 'scheduled_publicize',
				label: __( 'Jetpack Social' ),
				value: settings?.scheduled_publicize ?? false,
			},
		],
		[ settings ]
	);
	const handleApplyAll = () => {
		if ( ! blogSettings ) {
			return;
		}

		updateSettings( {
			data: {
				blogs: [ blogSettings ],
			},
			applyToAll: true,
		} );
	};

	return (
		<VStack alignment="stretch" spacing={ 4 }>
			<SelectControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={ __( 'Select device' ) }
				value={ selectedDeviceId?.toString() }
				onChange={ handleDeviceChange }
			>
				{ devices.map( ( device ) => (
					<option key={ device.device_id } value={ device.device_id }>
						{ device.device_name }
					</option>
				) ) }
			</SelectControl>
			<SettingsPanel options={ options } disabled={ isUpdating } onChange={ handleChange } />
			<HStack spacing={ 4 } alignment="start" justify="flex-start">
				<Button onClick={ handleApplyAll } variant="primary" isBusy={ isUpdating }>
					{ __( 'Apply to all sites' ) }
				</Button>
			</HStack>
		</VStack>
	);
};

export const StreamSettings = ( { className, blogId }: Props ) => {
	return (
		<div className={ clsx( 'stream-settings', className ) }>
			<TabPanel
				tabs={ [
					{
						name: 'web',
						title: __( 'Web' ),
					},
					{
						name: 'email',
						title: __( 'Email' ),
					},
					{
						name: 'devices',
						title: __( 'Devices' ),
					},
				] }
			>
				{ ( tab ) => {
					switch ( tab.name ) {
						case 'web':
							return <TimelineSettings blogId={ blogId } />;
						case 'email':
							return <EmailSettings blogId={ blogId } />;
						case 'devices':
							return <DevicesSettings blogId={ blogId } />;
					}
				} }
			</TabPanel>
		</div>
	);
};
