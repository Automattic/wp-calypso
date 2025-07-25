import { Dialog } from '@automattic/components';
import { Button, TextControl } from '@wordpress/components';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import * as React from 'react';
import ThreatFixHeader from 'calypso/components/jetpack/threat-fix-header';
import { Threat } from 'calypso/components/jetpack/threat-item/types';
import './style.scss';
import Notice from 'calypso/dashboard/components/notice';

interface Props {
	threat: Threat;
	action: 'fix' | 'ignore' | 'unignore';
	siteName: string;
	showDialog: boolean;
	onCloseDialog: ( action?: string | React.MouseEvent ) => void;
	onConfirmation: React.MouseEventHandler;
}

const ThreatDialog: React.FC< Props > = ( {
	action,
	onCloseDialog,
	onConfirmation,
	showDialog,
	threat,
} ) => {
	const isExtensionDeleteFixer =
		threat.signature === 'Vulnerable.WP.Extension' &&
		threat.fixable &&
		threat.fixable.fixer === 'delete';
	const [ confirmationInput, setConfirmationInput ] = React.useState( '' );
	// So we don't share the input value between different threats
	React.useEffect( () => {
		if ( showDialog ) {
			setConfirmationInput( '' );
		}
	}, [ showDialog, threat ] );
	const [ isInputHighlighted, setIsInputHighlighted ] = React.useState( false );
	const slug = threat.extension?.slug || 'unknown-slug';

	const handleDisabledButtonClick = React.useCallback( () => {
		setIsInputHighlighted( true );
		// Auto-reset the highlight after a short delay
		setTimeout( () => setIsInputHighlighted( false ), 1500 );
	}, [] );

	const buttons = React.useMemo( () => {
		let primaryButtonText;
		let isScary;

		switch ( action ) {
			case 'fix':
				primaryButtonText = translate( 'Fix threat' );
				isScary = false;
				break;
			case 'ignore':
				primaryButtonText = translate( 'Ignore threat' );
				isScary = true;
				break;
			case 'unignore':
				primaryButtonText = translate( 'Unignore threat' );
				isScary = true;
				break;
		}

		const buttons = [
			<Button className="threat-dialog__btn" onClick={ onCloseDialog }>
				{ translate( 'Go back' ) }
			</Button>,
		];

		if ( isExtensionDeleteFixer ) {
			const shouldBeDisabled = confirmationInput !== slug;
			buttons.push(
				<Button
					variant="primary"
					isDestructive
					className={ clsx( 'threat-dialog__btn', { 'is-visually-disabled': shouldBeDisabled } ) }
					onClick={ shouldBeDisabled ? handleDisabledButtonClick : onConfirmation }
				>
					{ translate( 'Delete now' ) }
				</Button>
			);
		} else {
			buttons.push(
				<Button
					variant="primary"
					isDestructive={ isScary }
					className="threat-dialog__btn"
					onClick={ onConfirmation }
				>
					{ primaryButtonText }
				</Button>
			);
		}

		return buttons;
	}, [
		action,
		onCloseDialog,
		onConfirmation,
		isExtensionDeleteFixer,
		confirmationInput,
		slug,
		handleDisabledButtonClick,
	] );

	const titleProps = React.useMemo( () => {
		let title;
		const titleClassName = `threat-dialog__header--${ action }-threat`;

		switch ( action ) {
			case 'fix':
				title = translate( 'Fix threat' );
				break;
			case 'ignore':
				title = translate( 'Do you really want to ignore this threat?' );
				break;
			case 'unignore':
				title = translate( 'Do you really want to unignore this threat?' );
				break;
		}

		return {
			title,
			titleClassName,
		};
	}, [ action ] );

	return (
		<Dialog
			additionalClassNames={ clsx( 'threat-dialog' ) }
			isVisible={ showDialog }
			buttons={ buttons }
			onClose={ onCloseDialog }
		>
			<h1 className={ clsx( titleProps.titleClassName ) }>{ titleProps.title }</h1>
			<p>
				{ action === 'fix' && translate( 'Jetpack will fix the threat:' ) }
				{ action === 'ignore' && translate( 'Jetpack will ignore the threat:' ) }
				{ action === 'unignore' && translate( 'Jetpack will unignore the threat:' ) }
			</p>
			<h3 className="threat-dialog__threat-title">
				<ThreatFixHeader threat={ threat } action={ action } />
			</h3>
			{ isExtensionDeleteFixer && (
				<>
					{ threat.fixable.extensionStatus === 'active' ? (
						<Notice variant="error">
							{ translate(
								'This %(extension_type)s seems to be currently active on your site. Deleting it may break your site. Please disable it first and check if your site is still working as expected, then proceed with the fix.',
								{
									args: {
										extension_type:
											threat.extension?.type === 'plugin'
												? translate( 'plugin' )
												: translate( 'theme' ),
									},
									comment:
										'%s is a translation of either "plugin" or "theme" depending on the type of extension being deleted.',
								}
							) }
						</Notice>
					) : (
						<Notice variant="warning">
							{ translate(
								'This %(extension_type)s seems to not currently be active on your site. Please note that deleting it may still have adverse effects and this action cannot be undone.',
								{
									args: {
										extension_type:
											threat.extension?.type === 'plugin'
												? translate( 'plugin' )
												: translate( 'theme' ),
									},
									comment:
										'%s is a translation of either "plugin" or "theme" depending on the type of extension being deleted.',
								}
							) }
						</Notice>
					) }
					{ threat.fixable.extras?.is_dotorg === false && (
						<p>
							{ translate(
								'We did not find this extension on WordPress.org. We encourage you to create a backup of your site before fixing this threat, to keep a copy of it.'
							) }
						</p>
					) }

					<p>
						{ translate(
							'To confirm you have read and understood the consequences, please enter the {{extension_type/}} slug {{slug/}} in the field below.',
							{
								components: {
									slug: <code>{ slug }</code>,
									extension_type:
										threat.extension?.type === 'plugin' ? (
											<>{ translate( 'plugin' ) }</>
										) : (
											<>{ translate( 'theme' ) }</>
										),
								},
								comment: '{{slug/}} is the slug of the extension (plugin or theme) being deleted.',
							}
						) }
					</p>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						help=""
						label=""
						onChange={ ( value: string ) => setConfirmationInput( value ) }
						value={ confirmationInput }
						className={ clsx( { 'is-highlighted': isInputHighlighted } ) }
						autoComplete="off"
					/>
				</>
			) }
			{ action === 'ignore' &&
				translate(
					'By ignoring this threat you confirm that you have reviewed the detected code and assume the risks of keeping a potentially malicious file on your site. If you are unsure please request an estimate with Codeable.'
				) }
			{ action === 'unignore' &&
				translate(
					'By unignoring this threat you confirm that you have reviewed the detected code and assume the risks of keeping a potentially malicious file on your site. If you are unsure please request an estimate with Codeable.'
				) }
		</Dialog>
	);
};

export default ThreatDialog;
