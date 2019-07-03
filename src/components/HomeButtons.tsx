import React from 'react';
import { Button, Grid } from '@material-ui/core';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  CallIcon,
  RestaurantIcon,
  HomeIcon,
  HotTubIcon,
  BusIcon,
  GroceryStoreIcon,
  HealingIcon,
  WifiIcon,
  WorkIcon,
  InfoIcon
} from './Icons';
import { THomeButton } from '../types';
import { colors, fonts } from '../App.styles';

const buttons: THomeButton[] = [
  {
    text: 'Food',
    icon: RestaurantIcon,
    to: '/food'
  },
  {
    text: 'Shelter',
    icon: HomeIcon,
    to: '/shelter'
  },
  {
    text: 'Hygiene',
    icon: HotTubIcon,
    to: '/hygiene'
  },
  {
    text: 'Transit',
    icon: BusIcon,
    to: '/transit'
  },
  {
    text: 'Resources',
    icon: GroceryStoreIcon,
    to: '/resources'
  },
  {
    text: 'Hotlines',
    icon: CallIcon,
    to: '/hotlines'
  },
  {
    text: 'Health',
    icon: HealingIcon,
    to: '/health'
  },
  {
    text: 'Wifi & Tech',
    icon: WifiIcon,
    to: '/wifi-and-tech'
  },
  {
    text: 'Job Training',
    icon: WorkIcon,
    to: '/work'
  },
  {
    text: 'Social Services',
    icon: InfoIcon,
    to: '/social-services'
  }
];

const HomeLink = styled(Link)`
  text-decoration: none;
`;

const HomeButton = styled(Button)`
  && {
    display: flex;
    align-items: stretch;
    width: 100%;
    padding: 10px;
    border-radius: 0;
    background: ${colors.greyDark};
    color: ${colors.white};
    text-decoration: none;
  }
  &&:hover {
    background: ${colors.greyDark};
  }
  > span {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    font-family: ${fonts.openSans};
    font-weight: 700;
    font-size: 22px;
    line-height: 24px;
    text-transform: none;
  }
  svg {
    width: 42px;
    height: auto;
    align-self: flex-end;
  }
` as typeof Button;

const HomeButtons = () => (
  <>
    {buttons.map((button: THomeButton) => {
      return (
        <Grid item xs={6} key={button.text}>
          <HomeLink to={button.to} data-test={button.text}>
            <HomeButton disableRipple={true} component={'span'}>
              {button.text}
              {button.icon}
            </HomeButton>
          </HomeLink>
        </Grid>
      );
    })}
  </>
);

export default HomeButtons;
