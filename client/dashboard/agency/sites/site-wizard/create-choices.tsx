import { WordPressLogo } from '@automattic/components/src/logos/wordpress-logo';
import { __ } from '@wordpress/i18n';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import SiteTypeIcon, { DevSiteMark } from '../add-new-site/site-type-icon';
import { Choice } from './choices';

/** The same three ways to create a site as the Add site menu, with the same marks. */
export default function CreateChoices( {
	onDevelopment,
	onHosted,
}: {
	onDevelopment: () => void;
	onHosted: ( host: 'wpcom' | 'pressable' ) => void;
} ) {
	const options = [
		{
			kind: 'development' as const,
			icon: (
				<SiteTypeIcon tone="dev">
					<DevSiteMark />
				</SiteTypeIcon>
			),
			title: __( 'Development site' ),
			description: __( 'Free on WordPress.com until you launch.' ),
			onClick: onDevelopment,
		},
		{
			kind: 'wpcom' as const,
			icon: (
				<SiteTypeIcon tone="wpcom">
					<WordPressLogo size={ 28 } />
				</SiteTypeIcon>
			),
			title: 'WordPress.com',
			description: __( 'A hosting plan for each site.' ),
			onClick: () => onHosted( 'wpcom' ),
		},
		{
			kind: 'pressable' as const,
			icon: (
				<SiteTypeIcon tone="pressable">
					<img src={ pressableIcon } alt="" width={ 26 } height={ 26 } />
				</SiteTypeIcon>
			),
			title: 'Pressable',
			description: __( 'One hosting plan for all your sites.' ),
			onClick: () => onHosted( 'pressable' ),
		},
	];

	return (
		<div className="agency-site-wizard__choices agency-site-wizard__entry-options agency-site-wizard__create-options">
			{ options.map( ( option ) => (
				<Choice
					key={ option.kind }
					illustration={ option.icon }
					title={ option.title }
					description={ option.description }
					onClick={ option.onClick }
				/>
			) ) }
		</div>
	);
}
