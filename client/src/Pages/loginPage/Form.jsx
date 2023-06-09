import React from "react";
import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  useMediaQuery,
  Typography,
  useTheme,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import ClipLoader from "react-spinners/ClipLoader";
import toast, { Toaster } from "react-hot-toast";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useDispatch } from "react-redux";
import { setAdmin, setClient, setExpert, setLogin } from "../../state";

const loginSchema = yup.object().shape({
  email: yup.string().email("email invalide").required("requis"),
  password: yup.string().required("requis"),
});

const registerSchema = yup.object().shape({
  Nom: yup.string().required("requis"),
  Prenom: yup.string().required("requis"),
  Telephone: yup
    .string()
    .matches(/^[0-9]+$/, "Ce champ ne doit contenir que des nombres")
    .required("requis"),
  email: yup.string().email("invalid email").required("requis"),
  password: yup
    .string()
    .required("requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .matches(
      /^(?=.*\d)(?=.*[A-Z]).{8,}$/,
      "Le mot de passe doit contenir au moins 1 lettre majuscule et 1 chiffre"
    ),
  password2: yup
    .string()
    .required("requis")
    .oneOf([yup.ref("password")], "Les mots de passe doivent correspondre"),
});

const initialValuesLogin = {
  email: "",
  password: "",
};

const initialValuesRegister = {
  Nom: "",
  Prenom: "",
  email: "",
  password: "",
  password2: "",
  Telephone: "",
};

const Form = () => {
  const [pageType, setPageType] = useState("login");
  const { palette } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const isLogin = pageType === "login";
  const isRegister = pageType === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [Send, setSend] = useState(false);

  const [Err, setErr] = useState();

  const register = async (values, onSubmitProps) => {
    const client = {
      nom: values.Nom,
      prenom: values.Prenom,
      email: values.email,
      motDePasse: values.password,
      tel: values.Telephone,
    };

    await fetch("http://localhost:3001/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(client),
    })
      .then(async (data) => {
        const USER = await data.json();
        if (USER._id) {
          onSubmitProps.resetForm();
          toast(
            <div>
              <h2>success</h2>
              <p>
                Vous vous êtes inscrit correctement; veuillez vous connecter,
                Merci.
              </p>
            </div>,
            {
              type: "success",
              position: "top-center",
              style: {
                background: "#6ad55e",
                color: "#fff",
              },
              duration: 4000,
            }
          );
          setTimeout(() => {
            setPageType("login");
          }, 4000);
        }
        if(USER.msg){
          setErr("Cet utilisateur existe déjà.");
        }
        if(USER.error){
          setErr("Une erreur c'est produite , reesayez svp");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const login = async (values, onSubmitProps) => {
    setSend(true);

    await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then(async (data) => {
        const USER = await data.json();
        console.log(USER);
        if (USER.token) {
          onSubmitProps.resetForm();
          setSend(false);
          onSubmitProps.resetForm();
          dispatch(
            setLogin({
              user: USER.user,
              token: USER.token,
            })
          );

          if(USER.type == 'admin'){
            dispatch(setAdmin());
          }else if (USER.type == 'client'){
            dispatch(setClient());
          } else if (USER.type == 'expert'){
            dispatch(setExpert());
          }
          navigate('/Profile');
        }

        if (USER.msg ){
          if (USER.msg == "Identifiants invalides.") {
            setErr("Email ou/et mot de passe incorrects !");
          } else if (USER.msg == "Cette utilisateur n'existe pas.") {
            setErr(
              "Vous n'avez pas de compte avec cet email ! Verifiez bien vos coordonnee."
            );
          } else {
            setErr("Une erreur s'est produite ; reessayer svp.");
          }
        }
        
        
      })
      .catch((err) => {
        console.log(err);
      });
    
  };

  const handleFormSubmit = async (values, onSubmitProps) => {
    // await login(values, onSubmitProps);
    if (isLogin) await login(values, onSubmitProps);
    if (isRegister) await register(values, onSubmitProps);
  };

  return (
    <Formik
      onSubmit={handleFormSubmit}
      initialValues={isLogin ? initialValuesLogin : initialValuesRegister}
      validationSchema={isLogin ? loginSchema : registerSchema}
    >
      {({
        values,
        errors,
        touched,
        handleBlur,
        handleChange,
        handleSubmit,
        setFieldValue,
        resetForm,
      }) => (
        <form onSubmit={handleSubmit}>
          <Box
            display="grid"
            gap="30px"
            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            sx={{
              "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
            }}
          >
            <Toaster />

            {isRegister && (
              <>
                <TextField
                  label="Nom"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.Nom}
                  name="Nom"
                  error={Boolean(touched.Nom) && Boolean(errors.Nom)}
                  helperText={touched.Nom && errors.Nom}
                  sx={{ gridColumn: "span 2" }}
                />

                <TextField
                  label="Prenom"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.Prenom}
                  name="Prenom"
                  error={Boolean(touched.Prenom) && Boolean(errors.Prenom)}
                  helperText={touched.Prenom && errors.Prenom}
                  sx={{ gridColumn: "span 2" }}
                />

                <TextField
                  label="Telephone"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.Telephone}
                  name="Telephone"
                  error={
                    Boolean(touched.Telephone) && Boolean(errors.Telephone)
                  }
                  helperText={touched.Telephone && errors.Telephone}
                  sx={{ gridColumn: "span 2" }}
                />
              </>
            )}

            <TextField
              label="Email"
              onBlur={handleBlur}
              onChange={handleChange}
              onClick={() => {
                setErr();
              }}
              value={values.email}
              name="email"
              error={Boolean(touched.email) && Boolean(errors.email)}
              helperText={touched.email && errors.email}
              sx={{ gridColumn: "span 4" }}
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              onBlur={handleBlur}
              onChange={handleChange}
              onClick={() => {
                setErr();
              }}
              value={values.password}
              name="password"
              error={Boolean(touched.password) && Boolean(errors.password)}
              helperText={touched.password && errors.password}
              sx={{ gridColumn: "span 4" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {isRegister && (
              <TextField
                label="Confirmation mot de passe"
                type={showPassword ? "text" : "password"}
                onBlur={handleBlur}
                onChange={handleChange}
                onClick={() => {
                  setErr();
                }}
                value={values.password2}
                name="password2"
                error={Boolean(touched.password2) && Boolean(errors.password2)}
                helperText={touched.password2 && errors.password2}
                sx={{ gridColumn: "span 4" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </Box>

          {/* BUTTONS */}
          <Box>
            <Button
              fullWidth
              type="submit"
              sx={{
                m: "2rem 0",
                p: "1rem",
                backgroundColor: "#00D5FA",
                color: "#FFFFFF",
                "&:hover": { color: "#00D5FA" },
              }}
            >
              {isLogin ? "CONNEXION" : "S'INSCRIRE"}
              <div style={{ marginLeft: "5%" }}>
                <ClipLoader
                  color={"#E6FBFF"}
                  loading={Send}
                  size={20}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />
              </div>
            </Button>
            {Err && <p className="error">{Err}</p>}
            <Typography
              onClick={() => {
                setPageType(isLogin ? "register" : "login");
                resetForm();
                setErr();
              }}
              sx={{
                textDecoration: "underline",
                color: palette.primary.main,
                "&:hover": {
                  cursor: "pointer",
                  color: palette.primary.light,
                },
              }}
            >
              {isLogin
                ? "Vous n'avez pas de compte ? Inscrivez-vous ici."
                : "Vous avez déjà un compte ? Connectez-vous ici."}
            </Typography>
          </Box>
        </form>
      )}
    </Formik>
  );
};

export default Form;