/**
 * External dependencies
 */

import { __ } from '@wordpress/i18n';

 /**
 * Internal dependencies
 */

export const settings = {
	name: 'a8c/chart',
	title: __( 'Chart' ),
	icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.1h-15V5h15v14.1zm0-16.1h-15c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path fill="none" d="M0 0h24v24H0z"/></svg>,
	category: 'common',
	keywords: [
		__( 'chart' ),
		__( 'jetpack' ),
	],
	attributes: {
		align: {
			type: 'string'
		},
		chart_type: {
			type: 'string',
			default: 'area-spline'
		},
		colors: {
			type: 'array',
			default: []
		},
		googlesheet_url: {
			type: 'string',
			default: 'https://docs.google.com/spreadsheets/d/1Ta7QDLsMGTC6vW03DnkvtQ5AE4IY1IeHnrFX7_7PZPE/pubhtml'
		},
		number_format: {
			type: 'string'
		},
		x_axis_label: {
			type: 'string'
		},
		y_axis_label: {
			type: 'string'
		},
	},
	chart_typeOptions: [
		{
			value: "bar",
			label: "Bar",
		},
		{
			value: "line",
			label: "Line",
		},
		{
			value: "area",
			label: "Area",
		},
		{
			value: "spline",
			label: "Spline",
		},
		{
			value: "area-spline",
			label: "Area-spline",
		},
		{
			value: "scatter",
			label: "Scatter",
		},
		{
			value: "step",
			label: "Step",
		},
		{
			value: "area-step",
			label: "Area-step",
		},
		{
			value: "pie",
			label: "Pie",
		},
		{
			value: "donut",
			label: "Donut",
		},
	],
	number_formatOptions: [
		{
			value: "none",
			label: "None",
		},
		{
			value: "dollar",
			label: "$",
		},
		{
			value: "euro",
			label: "€",
		},
		{
			value: "pound",
			label: "£",
		},
		{
			value: "percent",
			label: "%",
		},
	],
	validAlignments: [
		'left',
		'center',
		'right',
		'wide',
		'full'
	],
	allColors: [
		'#1f77b4',
		'#aec7e8',
		'#ff7f0e',
		'#ffbb78',
		'#2ca02c',
		'#98df8a',
		'#d62728',
		'#ff9896',
		'#9467bd',
		'#c5b0d5',
		'#8c564b',
		'#c49c94',
		'#e377c2',
		'#f7b6d2',
		'#7f7f7f',
		'#c7c7c7',
		'#bcbd22',
		'#dbdb8d',
		'#17becf',
		'#9edae5'
	],
};
