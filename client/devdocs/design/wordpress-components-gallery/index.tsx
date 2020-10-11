/**
 * External dependencies
 */
import React, { ReactNode } from 'react';

/**
 * WordPress dependencies
 */
import { Card, CardHeader, CardBody, Flex, FlexItem } from '@wordpress/components';

/**
 * Internal dependencies
 */
import AlignmentMatrixControlExample from './alignment-matrix-control';
import AnglePickerControlExample from './angle-picker-control';
import AnimateExample from './animate';
import AutocompleteExample from './autocomplete';
import BaseControlExample from './base-control';
import BoxControlExample from './box-control';
import ButtonExample from './button';
import ButtonGroupExample from './button-group';
import CardExample from './card';
import CheckboxControlExample from './checkbox-control';
import ClipboardButtonExample from './clipboard-button';
import ColorPaletteExample from './color-palette';
import CustomSelectControlExample from './custom-select-control';
import DateTimePickerExample from './date-time-picker';
import DisabledExample from './disabled';
import DraggableExample from './draggable';
import DropdownMenuExample from './dropdown-menu';
import ExternalLinkExample from './external-link';
import FocalPointPickerExample from './focal-point-picker';
import FontSizePickerExample from './font-size-picker';
import FormFileUploadExample from './form-file-upload';
import FormToggleExample from './form-toggle';
import FormTokenFieldExample from './form-token-field';
import GuideExample from './guide';
import PanelExample from './panel';
import PlaceholderExample from './placeholder';
import QueryControlsExample from './query-controls';
import RadioExample from './radio';
import RadioControlExample from './radio-control';
import ResizableBoxExample from './resizable-box';
import SlotFillExample from './slot-fill';
import SnackbarExample from './snackbar';
import SpinnerExample from './spinner';
import TabPanelExample from './tab-panel';
import TextExample from './text';
import TextControlExample from './text-control';
import TextareaControlExample from './textarea-control';
import TipExample from './tip';
import ToggleControlExample from './toggle-control';
import ToolbarExample from './toolbar';
import TooltipExample from './tooltip';
import TreeGridExample from './tree-grid';
import TreeSelectExample from './tree-select';
import VisuallyHiddenExample from './visually-hidden';

import './style.scss';

const ExampleComponent = ( { name, children }: { name: string; children: ReactNode } ) => (
	<FlexItem>
		<Card isElevated style={ { margin: '1rem 0' } }>
			<CardHeader>
				<strong>{ name }</strong>
			</CardHeader>
			<CardBody>{ children }</CardBody>
		</Card>
	</FlexItem>
);

const WordPressComponentsGallery = () => (
	<>
		<h1 className="wordpress-components-gallery__heading">
			The kitchen sink of WordPress components from the <code>@wordpress/components</code> package.
		</h1>
		<Flex justify="flex-start" gap={ 4 } style={ { flexWrap: 'wrap' } }>
			<ExampleComponent name="Alignment Matrix Control">
				<AlignmentMatrixControlExample />
			</ExampleComponent>

			<ExampleComponent name="Angle Picker Control">
				<AnglePickerControlExample />
			</ExampleComponent>

			<ExampleComponent name="Animate">
				<AnimateExample />
			</ExampleComponent>

			<ExampleComponent name="Autocomplete">
				<AutocompleteExample />
			</ExampleComponent>

			<ExampleComponent name="Base Control">
				<BaseControlExample />
			</ExampleComponent>

			<ExampleComponent name="Box Control">
				<BoxControlExample />
			</ExampleComponent>

			<ExampleComponent name="Button">
				<ButtonExample />
			</ExampleComponent>

			<ExampleComponent name="Button Group">
				<ButtonGroupExample />
			</ExampleComponent>

			<ExampleComponent name="Card">
				<CardExample />
			</ExampleComponent>

			<ExampleComponent name="Checkbox Control">
				<CheckboxControlExample />
			</ExampleComponent>

			<ExampleComponent name="Clipboard Button">
				<ClipboardButtonExample />
			</ExampleComponent>

			<ExampleComponent name="Color Palette">
				<ColorPaletteExample />
			</ExampleComponent>

			<ExampleComponent name="Custom Select Control">
				<CustomSelectControlExample />
			</ExampleComponent>

			<ExampleComponent name="Date Time Picker">
				<DateTimePickerExample />
			</ExampleComponent>

			<ExampleComponent name="Disabled">
				<DisabledExample />
			</ExampleComponent>

			<ExampleComponent name="Draggable">
				<DraggableExample />
			</ExampleComponent>

			<ExampleComponent name="Dropdown Menu">
				<DropdownMenuExample />
			</ExampleComponent>

			<ExampleComponent name="External Link">
				<ExternalLinkExample />
			</ExampleComponent>

			<ExampleComponent name="Focal Point Picker">
				<FocalPointPickerExample />
			</ExampleComponent>

			<ExampleComponent name="Font Size Picker">
				<FontSizePickerExample />
			</ExampleComponent>

			<ExampleComponent name="Form File Upload">
				<FormFileUploadExample />
			</ExampleComponent>

			<ExampleComponent name="Form Toggle">
				<FormToggleExample />
			</ExampleComponent>

			<ExampleComponent name="Form Token Field">
				<FormTokenFieldExample />
			</ExampleComponent>

			<ExampleComponent name="Guide">
				<GuideExample />
			</ExampleComponent>

			<ExampleComponent name="Panel">
				<PanelExample />
			</ExampleComponent>

			<ExampleComponent name="Placeholder">
				<PlaceholderExample />
			</ExampleComponent>

			<ExampleComponent name="Query Controls">
				<QueryControlsExample />
			</ExampleComponent>

			<ExampleComponent name="Radio">
				<RadioExample />
			</ExampleComponent>

			<ExampleComponent name="Radio Control">
				<RadioControlExample />
			</ExampleComponent>

			<ExampleComponent name="Resizable Box">
				<ResizableBoxExample />
			</ExampleComponent>

			<ExampleComponent name="Slot-Fill">
				<SlotFillExample />
			</ExampleComponent>

			<ExampleComponent name="Snackbar">
				<SnackbarExample />
			</ExampleComponent>

			<ExampleComponent name="Spinner">
				<SpinnerExample />
			</ExampleComponent>

			<ExampleComponent name="Tab Panel">
				<TabPanelExample />
			</ExampleComponent>

			<ExampleComponent name="Text">
				<TextExample />
			</ExampleComponent>

			<ExampleComponent name="Text Control">
				<TextControlExample />
			</ExampleComponent>

			<ExampleComponent name="Textarea Control">
				<TextareaControlExample />
			</ExampleComponent>

			<ExampleComponent name="Tip">
				<TipExample />
			</ExampleComponent>

			<ExampleComponent name="Toggle Control">
				<ToggleControlExample />
			</ExampleComponent>

			<ExampleComponent name="Toolbar">
				<ToolbarExample />
			</ExampleComponent>

			<ExampleComponent name="Tooltip">
				<TooltipExample />
			</ExampleComponent>

			<ExampleComponent name="Tree Grid">
				<TreeGridExample />
			</ExampleComponent>

			<ExampleComponent name="Tree Select">
				<TreeSelectExample />
			</ExampleComponent>

			<ExampleComponent name="Visually Hidden">
				<VisuallyHiddenExample />
			</ExampleComponent>
		</Flex>
	</>
);

export default WordPressComponentsGallery;
