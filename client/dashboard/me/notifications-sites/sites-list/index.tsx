import { BlogNotificationSettings, NotificationChannelSettings, Site } from '@automattic/api-core';
import { notificationSettingsQuery, sitesQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	Card,
	CardHeader,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
	CheckboxControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, chevronDown, bell, envelope } from '@wordpress/icons';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { Name, SiteIconLink, URL } from '../../../sites/site-fields';
import './style.scss';

interface SiteSettingsProps {
	site: Site;
	onOpen: ( selectedSite: Site[ 'ID' ] ) => void;
	isOpen: boolean;
	onClose: ( selectedSite: Site[ 'ID' ] ) => void;
	settings?: BlogNotificationSettings;
}

interface SettingsRowProps {
	label: string;
	name: keyof NotificationChannelSettings;
	checked: boolean;
	onChange: ( checked: boolean ) => void;
}

const SettingsRow = ( { label, checked, onChange }: SettingsRowProps ) => {
	return (
		<>
			<span className="sites-list__settings-label">{ label }</span>
			<input
				type="checkbox"
				className="sites-list__settings-checkbox"
				checked={ checked }
				onChange={ onChange }
			/>
			<input
				type="checkbox"
				className="sites-list__settings-checkbox"
				checked={ checked }
				onChange={ onChange }
			/>
		</>
	);
};

const SettingsHeader = ( { label }: SettingsHeaderProps ) => {
	return (
		<HStack className="sites-list__settings-header">
			<span>{ __( 'Activity' ) }</span>
			<HStack alignment="left">
				<Icon icon={ bell } size={ 24 } /> <span>{ __( 'Web' ) }</span>
			</HStack>
			<HStack alignment="left">
				<Icon icon={ envelope } size={ 24 } /> <span>{ __( 'Email' ) }</span>
			</HStack>
		</HStack>
	);
};

const SiteSettings = ( { site, onOpen, isOpen, onClose, settings }: SiteSettingsProps ) => {
	const handleClick = useCallback( () => {
		if ( isOpen ) {
			onClose( site.ID );
		} else {
			onOpen( site.ID );
		}
	}, [ onOpen, site.ID, isOpen, onClose ] );

	return (
		<Card
			key={ site.ID }
			className={ clsx( 'sites-list__card', {
				'is-open': isOpen,
			} ) }
			elevation={ isOpen ? 2 : 0 }
		>
			<CardHeader style={ { width: '100%' } }>
				<HStack spacing={ 4 } alignment="edge">
					<SiteIconLink site={ site } />
					<VStack spacing={ 0 } alignment="topLeft" style={ { width: '100%' } }>
						<Name site={ site } value={ site.name } />
						<URL site={ site } value={ site.URL } />
					</VStack>
					<Button onClick={ handleClick }>
						<Icon icon={ chevronDown } size={ 24 } />
					</Button>
				</HStack>
			</CardHeader>
			{ settings && (
				<CardBody className="sites-list__card-body">
					<SettingsHeader />
					{ /* <div className="sites-list__settings-fields"> */ }
					<SettingsRow
						label={ __( 'Comments on my site' ) }
						name="new_comment"
						checked={ settings.timeline.new_comment ?? false }
						onChange={ () => {} }
					/>
					<SettingsRow
						label={ __( 'Comments on my site' ) }
						name="new_comment"
						checked={ settings.timeline.new_comment ?? false }
						onChange={ () => {} }
					/>
					<SettingsRow
						label={ __( 'Comments on my site' ) }
						name="new_comment"
						checked={ settings.timeline.new_comment ?? false }
						onChange={ () => {} }
					/>
					<SettingsRow
						label={ __( 'Comments on my site' ) }
						name="new_comment"
						checked={ settings.timeline.new_comment ?? false }
						onChange={ () => {} }
					/>
					<SettingsRow
						label={ __( 'Comments on my site' ) }
						name="new_comment"
						checked={ settings.timeline.new_comment ?? false }
						onChange={ () => {} }
					/>
					{ /* </div> */ }
					{ /* <table>
						<thead>
							<tr>
								<th>Activity </th>
								<th>
									<Icon icon={ bell } size={ 24 } />
									Web
								</th>
								<th>
									<Icon icon={ envelope } size={ 24 } />
									Email
								</th>
							</tr>
						</thead>
						<tbody> */ }
					{ /* <tr>
								<td>{ __( 'Comments on my site' ) }</td>
								<td>
									<CheckboxControl
										name="timeline"
										checked={ settings.timeline.new_comment ?? false }
										onChange={ () => {} }
									/>
								</td>
								<td>
									<CheckboxControl
										name="email"
										checked={ settings.email.new_comment ?? false }
										onChange={ () => {} }
									/>
								</td>
							</tr>
							<tr>
								<td>{ __( 'Likes on my comments' ) }</td>
								<td>
									<CheckboxControl
										name="timeline"
										checked={ settings.timeline.comment_like ?? false }
										onChange={ () => {} }
									/>
								</td>
								<td>
									<CheckboxControl
										name="email"
										checked={ settings.email.comment_like ?? false }
										onChange={ () => {} }
									/>
								</td>
							</tr>
							<tr>
								<td>{ __( 'Likes on my posts' ) }</td>
								<td>
									<CheckboxControl
										name="timeline"
										checked={ settings.timeline.post_like ?? false }
										onChange={ () => {} }
									/>
								</td>
								<td>
									<CheckboxControl
										name="email"
										checked={ settings.email.post_like ?? false }
										onChange={ () => {} }
									/>
								</td>
							</tr>
							<tr>
								<td>{ __( 'Blog recommendations' ) }</td>
								<td>
									<CheckboxControl
										name="timeline"
										checked={ settings.timeline.recommended_blog ?? false }
										onChange={ () => {} }
									/>
								</td>
								<td>
									<CheckboxControl
										name="email"
										checked={ settings.email.recommended_blog ?? false }
										onChange={ () => {} }
									/>
								</td>
							</tr>
							<tr>
								<td>{ __( 'Subscriptions' ) }</td>
								<td>
									<CheckboxControl
										name="timeline"
										checked={ settings.timeline.follow ?? false }
										onChange={ () => {} }
									/>
								</td>
								<td>
									<CheckboxControl
										name="email"
										checked={ settings.email.follow ?? false }
										onChange={ () => {} }
									/>
								</td>
							</tr>
							<tr>
								<td>{ __( 'Site achievements' ) }</td>
								<td>
									<CheckboxControl
										name="timeline"
										checked={ settings.timeline.achievement ?? false }
										onChange={ () => {} }
									/>
								</td>
								<td>
									<CheckboxControl
										name="email"
										checked={ settings.email.mentions ?? false }
										onChange={ () => {} }
									/>
								</td>
							</tr>
							<tr>
								<td>{ __( 'Username mentions' ) }</td>
								<td>
									<CheckboxControl
										name="timeline"
										checked={ settings.timeline.mentions ?? false }
										onChange={ () => {} }
									/>
								</td>
								<td>
									<CheckboxControl
										name="email"
										checked={ settings.email.mentions ?? false }
										onChange={ () => {} }
									/>
								</td>
							</tr>
							<tr>
								<td>{ __( 'Jetpack Social' ) }</td>
								<td>
									<CheckboxControl
										name="timeline"
										checked={ settings.timeline.scheduled_publicize ?? false }
										onChange={ () => {} }
									/>
								</td>
								<td>
									<CheckboxControl
										name="email"
										checked={ settings.email.scheduled_publicize ?? false }
										onChange={ () => {} }
									/>
								</td>
							</tr>
							<tr>
								<td>{ __( 'Daily writing prompts' ) }</td>
								<td>
									<CheckboxControl
										name="timeline"
										checked={ settings.timeline.blogging_prompt ?? false }
										onChange={ () => {} }
									/>
								</td>
								<td>
									<CheckboxControl
										name="email"
										checked={ settings.email.blogging_prompt ?? false }
										onChange={ () => {} }
									/>
								</td>
							</tr>
							<tr>
								<td>{ __( 'Draft post reminders' ) }</td>
								<td>
									<CheckboxControl
										name="timeline"
										checked={ settings.timeline.blogging_prompt ?? false }
										onChange={ () => {} }
									/>
								</td>
								<td>
									<CheckboxControl
										name="email"
										checked={ settings.email.blogging_prompt ?? false }
										onChange={ () => {} }
									/>
								</td>
							</tr> */ }
					{ /* </tbody> */ }
					{ /* </table> */ }
				</CardBody>
			) }
		</Card>
	);
};

export const SitesList = () => {
	const { data: sites } = useSuspenseQuery(
		sitesQuery( {
			include_a8c_owned: true,
			site_visibility: 'visible',
		} )
	);
	const { data: settings } = useSuspenseQuery( notificationSettingsQuery() );
	const [ selectedSite, setSelectedSite ] = useState< Site[ 'ID' ] | null >( null );

	const handleClose = useCallback( () => {
		setSelectedSite( null );
	}, [] );

	const handleOpen = useCallback( ( siteId: Site[ 'ID' ] ) => {
		setSelectedSite( siteId );
	}, [] );

	return (
		<VStack spacing={ 4 }>
			{ sites.map( ( site ) => (
				<SiteSettings
					key={ site.ID }
					site={ site }
					onOpen={ handleOpen }
					onClose={ handleClose }
					isOpen={ selectedSite === site.ID }
					settings={ settings.blogs.find( ( blog ) => blog.blog_id === site.ID ) }
				/>
			) ) }
		</VStack>
	);
};
