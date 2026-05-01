import { __experimentalHStack as HStack, Button, Spinner } from '@wordpress/components';
import { Icon, image } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

interface Props {
	graphemeCount: number;
	onSubmit: () => void;
	isPending: boolean;
	limit: number;
}

const WARN_THRESHOLD_REMAINING = 50;

export function ComposerFooter( { graphemeCount, onSubmit, isPending, limit }: Props ) {
	const translate = useTranslate();
	const remaining = limit - graphemeCount;
	const tooLong = remaining < 0;
	const empty = graphemeCount === 0;
	const disabled = isPending || tooLong || empty;

	const countClass = clsx( 'atmosphere-composer__count', {
		'is-warn': remaining > 0 && remaining <= WARN_THRESHOLD_REMAINING,
		'is-over': remaining <= 0,
	} );

	return (
		<HStack className="atmosphere-composer__footer" justify="space-between" alignment="center">
			<div className="atmosphere-composer__footer-left">
				{ /* Slice 8 wires this up — image / video upload + alt-text + content warnings. */ }
				<button
					type="button"
					className="atmosphere-composer__media"
					aria-disabled="true"
					tabIndex={ 0 }
					aria-label={ translate( 'Add media' ) }
				>
					<Icon icon={ image } size={ 18 } />
				</button>
			</div>
			<HStack spacing={ 2 } className="atmosphere-composer__footer-right">
				<span id="atmosphere-composer-count" className={ countClass } aria-live="polite">
					{ remaining }
				</span>
				<Button
					variant="primary"
					disabled={ disabled }
					onClick={ onSubmit }
					aria-label={ translate( 'Post' ) }
				>
					{ isPending ? <Spinner /> : translate( 'Post' ) }
				</Button>
			</HStack>
		</HStack>
	);
}
