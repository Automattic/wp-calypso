import {
	__experimentalText as Text,
	__experimentalInputControl as InputControl,
	Button,
	Flex,
	FlexItem,
} from '@wordpress/components';
import { check, plus, closeSmall } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import { MAX_SELECTABLE_PATHS } from './config';
import { useSiteSlug } from './hooks/use-site-slug';
import { validatePath } from './schedule-form.helper';

interface Props {
	paths?: string[];
	borderWrapper?: boolean;
}
export function ScheduleFormPaths( props: Props ) {
	const translate = useTranslate();
	const siteSlug = useSiteSlug();
	const { paths: initPaths = [], borderWrapper = true } = props;

	const [ paths, setPaths ] = useState( initPaths );
	const [ newPath, setNewPath ] = useState( '' );
	const [ newPathError, setNewPathError ] = useState( '' );

	const removePath = useCallback(
		( index: number ) => {
			setPaths( paths.filter( ( _, i ) => i !== index ) );
		},
		[ paths ]
	);

	const onNewPathSubmit = useCallback( () => {
		const pathError = validatePath( newPath );
		setNewPathError( pathError );

		if ( pathError ) {
			return;
		}

		setPaths( [ ...paths, newPath ] );
		setNewPath( '' );
	}, [ newPath, paths ] );

	return (
		<div className="form-field form-field--paths">
			<label htmlFor="paths">{ translate( 'Test URL paths' ) }</label>

			<Text className="info-msg">
				{ translate(
					'Your schedule will test your front page for errors. Do you want to add additional paths?'
				) }
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
								/>
							</FlexItem>
							<FlexItem>
								<Button
									icon={ plus }
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
		</div>
	);
}
