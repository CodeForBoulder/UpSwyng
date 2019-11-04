import React, { useState } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";
import MenuIcon from "@material-ui/icons/Menu";
import { Link } from "react-router-dom";
import styled from "styled-components";

import Logo from "./Logo";
import Temperature from "./Temperature";
import MenuDrawer from "./MenuDrawer";
import { Container, font } from "../App.styles";

const StyledHeader = styled(AppBar)`
  && {
    background: none;
    box-shadow: none;
    margin-bottom: ${font.helpers.convertPixelsToRems(12)};
    margin-top: ${font.helpers.convertPixelsToRems(8)};
  }
` as typeof AppBar;

const StyledToolbar = styled(Toolbar)`
  && {
    padding: 0;
  }
` as typeof Toolbar;

const StyledMenuButton = styled(IconButton)`
  && {
    margin-left: ${font.helpers.convertPixelsToRems(-12)};
  }
` as typeof IconButton;

const StyledLogo = styled(Logo)`
  && {
    height: 40px;
    width: auto;
  }
` as typeof Logo;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <StyledHeader position="static">
      <StyledToolbar>
        <Container container justify="space-between" alignItems="center">
          <Grid item>
            <StyledMenuButton
              color="inherit"
              aria-label="Menu"
              onClick={() => setIsMenuOpen(true)}
            >
              <MenuIcon />
            </StyledMenuButton>
          </Grid>
          <Grid item>
            <Grid container alignItems="center" justify="space-between">
              <Grid item component={Temperature} />
              <Grid item>
                <Link to="/">
                  <StyledLogo />
                </Link>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </StyledToolbar>
      <MenuDrawer
        open={isMenuOpen}
        handleMenuClose={() => setIsMenuOpen(false)}
      />
    </StyledHeader>
  );
};

export default Header;