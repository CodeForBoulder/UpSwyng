import { Icon, Typography } from "@material-ui/core";

import { ArrowBack } from "@material-ui/icons";
import React from "react";
import { font } from "../App.styles";
import styled from "styled-components";
import { useHistory } from "react-router";

const CategoryBannerLink = styled.a`
  align-items: center;
  display: flex;
  padding-right: ${font.helpers.convertPixelsToRems(12)};
`;

const CategoryBannerIcon = styled(Icon)`
  && {
    align-items: center;
    display: flex;
    font-size: ${font.helpers.convertPixelsToRems(36)};
    height: auto;
    width: auto;
  }
` as typeof Icon;

const CategoryBannerArrowBack = styled(ArrowBack)`
  && {
    font-size: inherit;
  }
` as typeof ArrowBack;

interface Props {
  backRef?: Function;
}

const BackButton = ({ backRef }: Props) => {
  const history = useHistory();

  return (
    <CategoryBannerLink
      onClick={() => (backRef ? backRef() : history.push("/"))}
    >
      <Typography variant="srOnly">go back to previous page</Typography>
      <CategoryBannerIcon>
        <CategoryBannerArrowBack />
      </CategoryBannerIcon>
    </CategoryBannerLink>
  );
};

export default BackButton;
