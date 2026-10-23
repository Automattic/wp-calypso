import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, error, pending, published } from '@wordpress/icons';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import { caution } from '../../../components/notice/icons';
import { SectionHeader } from '../../../components/section-header';
import './style.scss';

export function MigrationCard( {
	title,
	description,
	decoration,
	actions,
	footer,
	children,
}: {
	title: React.ReactNode;
	description?: React.ReactNode;
	decoration?: React.ReactNode;
	actions?: React.ReactNode;
	footer?: React.ReactNode;
	children?: React.ReactNode;
} ) {
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 6 }>
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
					{ footer }
				</VStack>
			</CardBody>
		</Card>
	);
}

/**
 * The way out to an assisted migration, the same wherever the customer may want it.
 * Disabled until the handoff is built.
 */
export function AssistedHandoffLink() {
	return (
		<Button
			__next40pxDefaultSize
			variant="link"
			disabled
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
