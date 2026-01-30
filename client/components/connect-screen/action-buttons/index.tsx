import { Button, Spinner } from '@wordpress/components';
import clsx from 'clsx';

import './style.scss';

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
 * Button group for connect screen actions
 * @example
 * <ActionButtons
 *   primaryLabel="Accept Invite"
 *   primaryOnClick={() => handleAccept()}
 *   primaryLoading={isSubmitting}
 *   secondaryLabel="Cancel"
 *   secondaryOnClick={() => handleCancel()}
 *   tertiaryLabel="Sign in with another account"
 *   tertiaryOnClick={() => handleSignIn()}
 * />
 */
export function ActionButtons( {
	primaryLabel,
	primaryOnClick,
	primaryLoading = false,
	primaryDisabled = false,
	secondaryLabel,
	secondaryOnClick,
	secondaryDisabled = false,
	tertiaryLabel,
	tertiaryOnClick,
	className,
}: ActionButtonsProps ): JSX.Element {
	return (
		<div className={ clsx( 'connect-screen-action-buttons', className ) }>
			<div className="connect-screen-action-buttons__main">
				{ secondaryLabel && secondaryOnClick && (
					<Button
						variant="secondary"
						onClick={ secondaryOnClick }
						disabled={ secondaryDisabled || primaryLoading }
						className="connect-screen-action-buttons__secondary"
					>
						{ secondaryLabel }
					</Button>
				) }
				<Button
					variant="primary"
					onClick={ primaryOnClick }
					disabled={ primaryDisabled || primaryLoading }
					className="connect-screen-action-buttons__primary"
				>
					{ primaryLoading && <Spinner /> }
					{ ! primaryLoading && primaryLabel }
				</Button>
			</div>
			{ tertiaryLabel && tertiaryOnClick && (
				<Button
					variant="link"
					onClick={ tertiaryOnClick }
					className="connect-screen-action-buttons__tertiary"
				>
					{ tertiaryLabel }
				</Button>
			) }
		</div>
	);
}
