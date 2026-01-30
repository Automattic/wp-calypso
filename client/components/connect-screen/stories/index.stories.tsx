import { localizeUrl } from '@automattic/i18n-utils';
import { StoryObj, Meta } from '@storybook/react';
import { seen, edit, cog, check, chartBar } from '@wordpress/icons';
import { ActionButtons } from '../action-buttons';
import { BrandHeader } from '../brand-header';
import { ConsentText } from '../consent-text';
import { LoadingScreen } from '../loading-screen';
import { PermissionsList } from '../permissions-list';
import { ScreenLayout } from '../screen-layout';
import { UserCard } from '../user-card';

const meta: Meta = {
	title: 'client/components/ConnectScreen',
};

export default meta;

// Helper component for showing multiple variants
const VariantSection = ( { title, children }: { title: string; children: React.ReactNode } ) => (
	<div style={ { marginBottom: '2rem' } }>
		<h4 style={ { marginBottom: '0.5rem', color: '#666', fontSize: '12px' } }>{ title }</h4>
		{ children }
	</div>
);

// Mock data
const mockUser = {
	displayName: 'John Doe',
	email: 'john.doe@example.com',
	avatarUrl: 'https://gravatar.com/avatar/00000000000000000000000000000000?d=mp',
};

const mockPermissions = [
	{ icon: seen, label: 'View your profile information' },
	{ icon: edit, label: 'Edit your posts and pages' },
	{ icon: cog, label: 'Manage your site settings' },
	{ icon: check, label: 'Access your media library' },
	{ icon: chartBar, label: 'View your site statistics' },
];

// BrandHeader - All variants
export const BrandHeaderVariants: StoryObj< typeof BrandHeader > = {
	render: () => (
		<div>
			<VariantSection title="Title only">
				<BrandHeader title="Connect Your Account" />
			</VariantSection>
			<VariantSection title="With description">
				<BrandHeader
					title="Join the Team"
					description="You've been invited to collaborate on this project"
				/>
			</VariantSection>
			<VariantSection title="With logo">
				<BrandHeader
					logo="https://wordpress.com/calypso/images/wordpress/logo-stars.svg"
					logoAlt="WordPress Logo"
					logoWidth={ 72 }
					logoHeight={ 72 }
					title="Connect to WordPress.com"
					description="Link your account to get started"
				/>
			</VariantSection>
		</div>
	),
};

// UserCard - All sizes
export const UserCardVariants: StoryObj< typeof UserCard > = {
	render: () => (
		<div>
			<VariantSection title="Small">
				<UserCard user={ mockUser } size="small" />
			</VariantSection>
			<VariantSection title="Large">
				<UserCard user={ mockUser } size="large" />
			</VariantSection>
		</div>
	),
};

// ActionButtons - All configurations
export const ActionButtonsVariants: StoryObj< typeof ActionButtons > = {
	render: () => (
		<div>
			<VariantSection title="Primary only">
				<ActionButtons primaryLabel="Accept Invite" primaryOnClick={ () => alert( 'Accepted!' ) } />
			</VariantSection>
			<VariantSection title="Primary + Secondary">
				<ActionButtons
					primaryLabel="Accept"
					primaryOnClick={ () => alert( 'Accepted!' ) }
					secondaryLabel="Decline"
					secondaryOnClick={ () => alert( 'Declined!' ) }
				/>
			</VariantSection>
			<VariantSection title="All buttons">
				<ActionButtons
					primaryLabel="Accept Invite"
					primaryOnClick={ () => alert( 'Accepted!' ) }
					secondaryLabel="Decline"
					secondaryOnClick={ () => alert( 'Declined!' ) }
					tertiaryLabel="Sign in with another account"
					tertiaryOnClick={ () => alert( 'Sign in!' ) }
				/>
			</VariantSection>
			<VariantSection title="Loading state">
				<ActionButtons
					primaryLabel="Accept Invite"
					primaryOnClick={ () => {} }
					primaryLoading
					secondaryLabel="Cancel"
					secondaryOnClick={ () => {} }
				/>
			</VariantSection>
		</div>
	),
};

// ConsentText - All variants
export const ConsentTextVariants: StoryObj< typeof ConsentText > = {
	render: () => (
		<div>
			<VariantSection title="Plain text">
				<ConsentText>By continuing, you agree to our terms and conditions.</ConsentText>
			</VariantSection>
			<VariantSection title="With links">
				<ConsentText>
					By continuing, you agree to our{ ' ' }
					<a href={ localizeUrl( 'https://wordpress.com/tos/' ) } target="_blank" rel="noreferrer">
						Terms of Service
					</a>{ ' ' }
					and{ ' ' }
					<a
						href={ localizeUrl( 'https://automattic.com/privacy/' ) }
						target="_blank"
						rel="noreferrer"
					>
						Privacy Policy
					</a>
					.
				</ConsentText>
			</VariantSection>
		</div>
	),
};

// PermissionsList - All variants
export const PermissionsListVariants: StoryObj< typeof PermissionsList > = {
	render: () => (
		<div>
			<VariantSection title="Default">
				<PermissionsList
					title="This app will be able to:"
					permissions={ mockPermissions.slice( 0, 3 ) }
				/>
			</VariantSection>
			<VariantSection title="Expandable (click to expand)">
				<PermissionsList
					title="This app will be able to:"
					permissions={ mockPermissions }
					maxVisible={ 2 }
				/>
			</VariantSection>
			<VariantSection title="With learn more link">
				<PermissionsList
					title="This app will be able to:"
					permissions={ mockPermissions.slice( 0, 3 ) }
					learnMoreText="Learn more about permissions"
					learnMoreUrl={ localizeUrl( 'https://wordpress.com/support/' ) }
				/>
			</VariantSection>
		</div>
	),
};

// LoadingScreen - All variants
export const LoadingScreenVariants: StoryObj< typeof LoadingScreen > = {
	render: () => (
		<div>
			<VariantSection title="Default">
				<LoadingScreen />
			</VariantSection>
			<VariantSection title="With message">
				<LoadingScreen message="Connecting your account..." />
			</VariantSection>
		</div>
	),
};

// Full Example - Combined Components
export const FullInviteScreen: StoryObj = {
	render: () => (
		<ScreenLayout backgroundColor="#f6f7f7">
			<BrandHeader
				logo="https://wordpress.com/calypso/images/wordpress/logo-stars.svg"
				logoAlt="WordPress Logo"
				logoWidth={ 72 }
				logoHeight={ 72 }
				title="Join the Team"
				description="You've been invited to become an editor on example.wordpress.com"
			/>
			<UserCard user={ mockUser } size="large" />
			<PermissionsList
				title="As an editor, you'll be able to:"
				permissions={ [
					{ icon: edit, label: 'Create and edit posts' },
					{ icon: chartBar, label: 'View site statistics' },
					{ icon: cog, label: 'Manage media uploads' },
				] }
			/>
			<ActionButtons
				primaryLabel="Accept Invite"
				primaryOnClick={ () => alert( 'Accepted!' ) }
				secondaryLabel="Decline"
				secondaryOnClick={ () => alert( 'Declined!' ) }
				tertiaryLabel="Sign in with another account"
				tertiaryOnClick={ () => alert( 'Switch account!' ) }
			/>
			<ConsentText>
				By accepting, you agree to our{ ' ' }
				<a href={ localizeUrl( 'https://wordpress.com/tos/' ) } target="_blank" rel="noreferrer">
					Terms of Service
				</a>
				.
			</ConsentText>
		</ScreenLayout>
	),
};
