import {
	__experimentalText as Text,
	__experimentalInputControl as InputControl,
	Button,
	Flex,
	FlexItem,
} from '@wordpress/components';
import { check, plus } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';

interface Props {
	borderWrapper?: boolean;
}
export function ScheduleFormPaths( props: Props ) {
	const translate = useTranslate();
	const { borderWrapper = true } = props;

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
							<InputControl value="lorem-ipsum-dolor.sit" size="__unstable-large" readOnly />
						</FlexItem>
						<FlexItem>
							<Button disabled icon={ check } __next40pxDefaultSize />
						</FlexItem>
					</Flex>
				</div>
				<div className="new-path">
					<Flex className="path" gap={ 2 }>
						<FlexItem isBlock={ true }>
							<InputControl value="lorem-ipsum-dolor.sit" size="__unstable-large" />
						</FlexItem>
						<FlexItem>
							<Button variant="secondary" icon={ plus } __next40pxDefaultSize />
						</FlexItem>
					</Flex>
				</div>
			</div>
		</div>
	);
}
