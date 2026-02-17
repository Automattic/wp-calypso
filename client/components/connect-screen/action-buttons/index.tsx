import { Button, Spinner } from '@wordpress/components';
import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

export interface ActionButtonsProps {
	primaryLabel: ReactNode;
	primaryOnClick: () => void;
	primaryLoading?: boolean;
	primaryDisabled?: boolean;
	primaryClassName?: string;
	secondaryLabel?: ReactNode;
	secondaryOnClick?: () => void;
	secondaryDisabled?: boolean;
	secondaryClassName?: string;
	tertiaryLabel?: ReactNode;
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
 *   primaryClassName="custom-primary-class"
 *   secondaryLabel="Cancel"
 *   secondaryOnClick={() => handleCancel()}
 *   secondaryClassName="custom-secondary-class"
 *   tertiaryLabel="Sign in with another account"
 *   tertiaryOnClick={() => handleSignIn()}
 * />
 */
export function ActionButtons( {
	primaryLabel,
	primaryOnClick,
	primaryLoading = false,
	primaryDisabled = false,
	primaryClassName,
	secondaryLabel,
	secondaryOnClick,
	secondaryDisabled = false,
	secondaryClassName,
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
						className={ clsx( 'connect-screen-action-buttons__secondary', secondaryClassName ) }
					>
						{ secondaryLabel }
					</Button>
				) }
				<Button
					variant="primary"
					onClick={ primaryOnClick }
					disabled={ primaryDisabled || primaryLoading }
					className={ clsx( 'connect-screen-action-buttons__primary', primaryClassName ) }
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
