import type { ReactNode } from 'react';

/**
 * User information for displaying in user cards
 */
export interface UserCardUser {
	displayName: string;
	email: string;
	avatarUrl?: string;
}

/**
 * Permission item with optional icon
 */
export interface Permission {
	icon?: 'check' | 'view' | 'edit' | 'manage';
	label: string;
}

/**
 * Props for ScreenLayout component
 */
export interface ScreenLayoutProps {
	children: ReactNode;
	className?: string;
	backgroundColor?: string;
}

/**
 * Props for BrandHeader component
 */
export interface BrandHeaderProps {
	logo?: string | ReactNode;
	logoAlt?: string;
	logoWidth?: number;
	logoHeight?: number;
	title: string;
	description?: string;
	className?: string;
}

/**
 * Props for UserCard component
 */
export interface UserCardProps {
	user: UserCardUser;
	size?: 'small' | 'large';
	className?: string;
}

/**
 * Props for ActionButtons component
 */
export interface ActionButtonsProps {
	primaryLabel: string;
	primaryOnClick: () => void;
	primaryLoading?: boolean;
	primaryDisabled?: boolean;
	secondaryLabel?: string;
	secondaryOnClick?: () => void;
	secondaryDisabled?: boolean;
	tertiaryLabel?: string;
	tertiaryOnClick?: () => void;
	className?: string;
}

/**
 * Props for ConsentText component
 */
export interface ConsentTextProps {
	text: string;
	links?: Record< string, string >;
	className?: string;
}

/**
 * Props for PermissionsList component
 */
export interface PermissionsListProps {
	title?: string;
	permissions: Permission[];
	maxVisible?: number;
	learnMoreText?: string;
	learnMoreUrl?: string;
	className?: string;
}

/**
 * Props for LoadingScreen component
 */
export interface LoadingScreenProps {
	message?: string;
	className?: string;
}
