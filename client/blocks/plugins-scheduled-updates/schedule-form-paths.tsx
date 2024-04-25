import {
	__experimentalText as Text,
	__experimentalInputControl as InputControl,
	Button,
	Flex,
	FlexItem,
} from '@wordpress/components';
import { check, plus, closeSmall, rotateRight } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback, useEffect } from 'react';
import { useScheduledUpdatesVerifyPathQuery } from 'calypso/data/plugins/use-scheduled-updates-verify-path-query';
import { useSelector } from 'calypso/state';
import getSiteId from '../../state/sites/selectors/get-site-id';
import { MAX_SELECTABLE_PATHS } from './config';
import { useSiteSlug } from './hooks/use-site-slug';
import { prepareRelativePath, validatePath } from './schedule-form.helper';

interface Props {
	paths?: string[];
	borderWrapper?: boolean;
}
export function ScheduleFormPaths( props: Props ) {
	const translate = useTranslate();
	const siteSlug = useSiteSlug();
	const siteId = useSelector( ( state ) => getSiteId( state, siteSlug ) );
	const { paths: initPaths = [], borderWrapper = true } = props;

	const [ paths, setPaths ] = useState( initPaths );
	const [ newPath, setNewPath ] = useState( '' );
	const [ newPathError, setNewPathError ] = useState( '' );
	const [ newPathSubmitted, setNewPathSubmitted ] = useState( false );
	const { data: verificationData, isFetching: isVerifying } = useScheduledUpdatesVerifyPathQuery(
		siteId as number,
		newPath,
		{
			enabled: newPathSubmitted && !! newPath && !! siteId,
		}
	);
	const pathAvailable = verificationData?.available;

	/**
	 * Callbacks
	 */
	const resetFormState = useCallback( () => {
		setNewPath( '' );
		setNewPathError( '' );
		setNewPathSubmitted( false );
	}, [] );

	const addPath = useCallback( () => {
		if ( newPathSubmitted && ! newPathError && pathAvailable ) {
			setPaths( [ ...paths, newPath ] );
			resetFormState();
		}
	}, [ newPath, paths, newPathSubmitted, newPathError, pathAvailable ] );

	const removePath = useCallback(
		( index: number ) => {
			setPaths( paths.filter( ( _, i ) => i !== index ) );
		},
		[ paths ]
	);

	const onNewPathSubmit = useCallback( () => {
		const validationErrors = validatePath( newPath, paths );
		! validationErrors && setNewPathSubmitted( true );
		setNewPathError( validationErrors );
	}, [ newPath, paths, newPathError ] );

	/**
	 * Effects
	 */
	useEffect( addPath, [ addPath ] );
	useEffect( () => setNewPathSubmitted( false ), [ newPath ] );

	return (
		<div className="form-field form-field--paths">
			<label htmlFor="paths">{ translate( 'Test URL paths' ) }</label>

			<Text className="info-msg">
				{
					/* translators: maxPaths is a number, e.g. 5  */
					translate(
						'Your schedule will test your front page for errors. Add up to %(maxPaths)s additional paths to test:',
						{
							args: { maxPaths: MAX_SELECTABLE_PATHS },
						}
					)
				}
			</Text>
			<div className={ classnames( { 'form-control-container': borderWrapper } ) }>
				<Text className="info-msg">Website URL paths</Text>

				<div className="paths">
					<Flex className="path" gap={ 2 }>
						<FlexItem isBlock={ true }>
							<InputControl value={ siteSlug } size="__unstable-large" readOnly />
						</FlexItem>
						<FlexItem>
							<Button disabled icon={ check } __next40pxDefaultSize />
						</FlexItem>
					</Flex>
					{ paths.map( ( path, i ) => (
						<Flex className="path" gap={ 2 } key={ i }>
							<FlexItem isBlock={ true }>
								<InputControl value={ path } size="__unstable-large" readOnly />
							</FlexItem>
							<FlexItem>
								<Button
									icon={ closeSmall }
									__next40pxDefaultSize
									onClick={ () => removePath( i ) }
								/>
							</FlexItem>
						</Flex>
					) ) }
				</div>
				{ paths.length < MAX_SELECTABLE_PATHS && (
					<div className="new-path">
						<Flex gap={ 2 }>
							<FlexItem isBlock={ true }>
								<InputControl
									value={ newPath }
									size="__unstable-large"
									autoComplete="off"
									placeholder={ translate( '/add-path' ) }
									onChange={ ( p ) => setNewPath( p || '' ) }
									onKeyPress={ ( e ) => {
										if ( e.key === 'Enter' ) {
											// Prevent form submission on Enter key press
											e.preventDefault();
											onNewPathSubmit();
										}
									} }
									onPaste={ ( e ) => {
										if ( ! newPath ) {
											e.preventDefault();

											const value = e.clipboardData.getData( 'text' );
											setNewPath( prepareRelativePath( value ) );
										}
									} }
								/>
							</FlexItem>
							<FlexItem>
								<Button
									className={ classnames( { 'is-verifying': isVerifying } ) }
									icon={ isVerifying ? rotateRight : plus }
									disabled={ isVerifying }
									variant="secondary"
									onClick={ onNewPathSubmit }
									__next40pxDefaultSize
								/>
							</FlexItem>
						</Flex>
					</div>
				) }
			</div>
			{ newPathError && <Text className="validation-msg">{ newPathError }</Text> }
			{ MAX_SELECTABLE_PATHS === paths.length && (
				<Text className="info-msg">
					{ translate( 'You reached the maximum number of paths.' ) }
				</Text>
			) }
		</div>
	);
}
