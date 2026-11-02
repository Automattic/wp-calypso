import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, error, pending, people, published } from '@wordpress/icons';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody, CardFooter } from '../../../components/card';
import { caution } from '../../../components/notice/icons';
import RouterLinkButton from '../../../components/router-link-button';
import { SectionHeader } from '../../../components/section-header';
import { Text } from '../../../components/text';
import type { ComponentProps } from 'react';
import './style.scss';

export function MigrationCard( {
	title,
	description,
	decoration,
	actions,
	note,
	children,
}: {
	title: React.ReactNode;
	description?: React.ReactNode;
	decoration?: React.ReactNode;
	actions?: React.ReactNode;
	note?: React.ReactNode;
	children?: React.ReactNode;
} ) {
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 6 } className={ note ? 'wordpress-migration__above-note' : undefined }>
					<VStack spacing={ 4 }>
						{ /* The description lines up with the rest of the card, not indented under the title's icon. */ }
						<VStack spacing={ 2 }>
							<SectionHeader
								title={ title }
								decoration={ decoration }
								level={ 3 }
								className="wordpress-migration__card-header"
							/>
							{ description && <Text variant="muted">{ description }</Text> }
						</VStack>
						{ children }
					</VStack>
					{ actions && (
						<ButtonStack justify="flex-start" wrap>
							{ actions }
						</ButtonStack>
					) }
				</VStack>
			</CardBody>
			{ note && <CardFooter className="wordpress-migration__note">{ note }</CardFooter> }
		</Card>
	);
}

/**
 * The way out to an assisted migration, the same wherever the customer may want it.
 */
export function AssistedHandoffLink( { siteSlug }: { siteSlug: string } ) {
	return (
		<RouterLinkButton
			variant="link"
			className="wordpress-migration__note-link"
			to={ `/sites/${ siteSlug }/migration-overview/assisted` }
		>
			{ __( 'Have our team handle this migration for you, included in your plan.' ) }
		</RouterLinkButton>
	);
}

/**
 * A few short points in a migration card, each with its icon.
 */
export function IconList( {
	items,
}: {
	items: { icon: ComponentProps< typeof Icon >[ 'icon' ]; text: string }[];
} ) {
	return (
		<VStack as="ul" spacing={ 3 } className="wordpress-migration__icon-list">
			{ items.map( ( { icon, text } ) => (
				<HStack as="li" key={ text } spacing={ 3 } justify="flex-start">
					<span className="wordpress-migration__icon-list-icon">
						<Icon icon={ icon } size={ 16 } />
					</span>
					<Text>{ text }</Text>
				</HStack>
			) ) }
		</VStack>
	);
}

const STATUS_ICONS = { pending, warning: caution, error, success: published, team: people };

/**
 * A card's status, using the notices' own icons for warnings, errors and success, and people for our team.
 */
export function StatusIcon( { status }: { status: keyof typeof STATUS_ICONS } ) {
	return (
		<Icon
			icon={ STATUS_ICONS[ status ] }
			size={ 22 }
			// The icons are drawn on a 24-unit grid. Scaled to 22px they blur, so trim a unit from each side instead:
			// pixel for pixel, still centered, and the drawings sit well inside the trim.
			viewBox="1 1 22 22"
			className="wordpress-migration__status-icon"
		/>
	);
}
