import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, error, pending, published } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody, CardFooter } from '../../../components/card';
import { caution } from '../../../components/notice/icons';
import { SectionHeader } from '../../../components/section-header';
import { wpcomLink } from '../../../utils/link';
import type { Site } from '@automattic/api-core';
import './style.scss';

export function MigrationCard( {
	title,
	description,
	decoration,
	actions,
	secondaryAction,
	note,
	children,
}: {
	title: React.ReactNode;
	description?: React.ReactNode;
	decoration?: React.ReactNode;
	actions?: React.ReactNode;
	secondaryAction?: React.ReactNode;
	note?: React.ReactNode;
	children?: React.ReactNode;
} ) {
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 6 } className={ note ? 'wordpress-migration__above-note' : undefined }>
					<VStack spacing={ 4 }>
						<SectionHeader
							title={ title }
							description={ description }
							decoration={ decoration }
							level={ 3 }
							className="wordpress-migration__card-header"
						/>
						{ children }
					</VStack>
					{ actions && (
						<ButtonStack justify="flex-start" wrap>
							{ actions }
						</ButtonStack>
					) }
					{ secondaryAction }
				</VStack>
			</CardBody>
			{ note && <CardFooter className="wordpress-migration__note">{ note }</CardFooter> }
		</Card>
	);
}

export function AssistedHandoffLink( {
	site,
	sourceUrl,
	step,
	disabled,
}: {
	site: Site;
	sourceUrl?: string | null;
	step: 'connect' | 'paused' | 'failed';
	disabled?: boolean;
} ) {
	const query = new URLSearchParams( window.location.search );
	const href = addQueryArgs( wpcomLink( '/setup/site-migration/site-migration-how-to-migrate' ), {
		from: sourceUrl ?? undefined,
		siteId: site.ID,
		siteSlug: site.slug,
		platform: 'wordpress',
		action: 'migrate',
		how: 'difm',
		ref: 'reprint-migration-overview',
		reprintStep: step,
		flags: query.get( 'flags' ) ?? undefined,
		sessionId: query.get( 'sessionId' ) ?? undefined,
		source: query.get( 'source' ) ?? undefined,
	} );
	return (
		<Button
			__next40pxDefaultSize
			variant="link"
			href={ href }
			disabled={ disabled }
			className="wordpress-migration__align-start"
		>
			{ __( 'Have our team handle this migration for you, included in your plan.' ) }
		</Button>
	);
}

const STATUS_ICONS = { pending, warning: caution, error, success: published };

/**
 * A card's status, using the notices' own icons for warnings, errors and success.
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
