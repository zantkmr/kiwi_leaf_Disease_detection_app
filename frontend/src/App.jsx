import React, { useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Box,
  Paper,
  Avatar,
  Fade,
  Collapse,
} from "@mui/material";
import { Upload, Leaf, CheckCircle, AlertTriangle, Eye, Camera, CloudUpload, Image as ImageIcon } from "lucide-react";
import { styled } from "@mui/material/styles";

// Enhanced markdown renderer component
const MarkdownRenderer = ({ content }) => {
  const renderMarkdown = (text) => {
    if (!text) return '';
    
    // Split by lines for processing
    const lines = text.split('\n');
    const processedLines = [];
    let listItems = [];
    let currentListType = null;
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Handle headers
      if (trimmedLine.startsWith('### ')) {
        // Flush any pending list
        if (listItems.length > 0) {
          processedLines.push(renderList(listItems, currentListType));
          listItems = [];
          currentListType = null;
        }
        processedLines.push(
          <Typography key={index} variant="h6" fontWeight="bold" sx={{ mt: 3, mb: 1.5, color: '#047857' }}>
            {trimmedLine.replace('### ', '')}
          </Typography>
        );
        return;
      }
      
      if (trimmedLine.startsWith('## ')) {
        if (listItems.length > 0) {
          processedLines.push(renderList(listItems, currentListType));
          listItems = [];
          currentListType = null;
        }
        processedLines.push(
          <Typography key={index} variant="h5" fontWeight="bold" sx={{ mt: 3, mb: 1.5, color: '#047857' }}>
            {trimmedLine.replace('## ', '')}
          </Typography>
        );
        return;
      }
      
      if (trimmedLine.startsWith('# ')) {
        if (listItems.length > 0) {
          processedLines.push(renderList(listItems, currentListType));
          listItems = [];
          currentListType = null;
        }
        processedLines.push(
          <Typography key={index} variant="h4" fontWeight="bold" sx={{ mt: 3, mb: 1.5, color: '#047857' }}>
            {trimmedLine.replace('# ', '')}
          </Typography>
        );
        return;
      }
      
      // Handle numbered lists
      if (/^\d+\.\s/.test(trimmedLine)) {
        if (currentListType !== 'numbered') {
          if (listItems.length > 0) {
            processedLines.push(renderList(listItems, currentListType));
          }
          listItems = [];
          currentListType = 'numbered';
        }
        const content = trimmedLine.replace(/^\d+\.\s*/, '');
        listItems.push({ content, index, type: 'numbered' });
        return;
      }
      
      // Handle bullet points
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ') || trimmedLine.startsWith('* ')) {
        if (currentListType !== 'bullet') {
          if (listItems.length > 0) {
            processedLines.push(renderList(listItems, currentListType));
          }
          listItems = [];
          currentListType = 'bullet';
        }
        const content = trimmedLine.replace(/^[-•*]\s*/, '');
        listItems.push({ content, index, type: 'bullet' });
        return;
      }
      
      // Handle horizontal rule
      if (trimmedLine === '---' || trimmedLine === '***') {
        if (listItems.length > 0) {
          processedLines.push(renderList(listItems, currentListType));
          listItems = [];
          currentListType = null;
        }
        processedLines.push(<Box key={index} sx={{ borderTop: 2, borderColor: '#e5e7eb', my: 3 }} />);
        return;
      }
      
      // Handle empty lines
      if (trimmedLine === '') {
        if (listItems.length > 0) {
          processedLines.push(renderList(listItems, currentListType));
          listItems = [];
          currentListType = null;
        }
        processedLines.push(<Box key={index} sx={{ height: 12 }} />);
        return;
      }
      
      // Regular paragraph
      if (listItems.length > 0) {
        processedLines.push(renderList(listItems, currentListType));
        listItems = [];
        currentListType = null;
      }
      
      processedLines.push(
        <Typography key={index} variant="body1" sx={{ mb: 1.5, lineHeight: 1.7 }}>
          {formatInlineMarkdown(trimmedLine)}
        </Typography>
      );
    });
    
    // Flush any remaining list items
    if (listItems.length > 0) {
      processedLines.push(renderList(listItems, currentListType));
    }
    
    return <Box>{processedLines}</Box>;
  };
  
  const renderList = (items, listType) => {
    const key = `list-${items[0]?.index || 0}`;
    return (
      <Box key={key} component={listType === 'numbered' ? 'ol' : 'ul'} sx={{ 
        pl: 3, 
        mb: 2,
        '& li': {
          mb: 1,
          '&::marker': {
            color: '#059669',
            fontWeight: 'bold'
          }
        }
      }}>
        {items.map((item, idx) => (
          <Box key={`${item.index}-${idx}`} component="li" sx={{ lineHeight: 1.6 }}>
            <Typography variant="body1" component="span">
              {formatInlineMarkdown(item.content)}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };
  
  const formatInlineMarkdown = (text) => {
    // Handle bold text with **text** or ***text***
    const parts = text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('***') && part.endsWith('***')) {
        return (
          <Typography key={index} component="span" sx={{ fontWeight: 'bold', color: '#047857', fontStyle: 'italic' }}>
            {part.slice(3, -3)}
          </Typography>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Typography key={index} component="span" sx={{ fontWeight: 'bold', color: '#059669' }}>
            {part.slice(2, -2)}
          </Typography>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <Typography key={index} component="span" sx={{ 
            bgcolor: '#f1f5f9', 
            px: 0.5, 
            py: 0.25, 
            borderRadius: 0.5, 
            fontFamily: 'monospace',
            fontSize: '0.9em'
          }}>
            {part.slice(1, -1)}
          </Typography>
        );
      }
      return part;
    });
  };
  
  return renderMarkdown(content);
};

// Styled components
const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: "100vh",
  background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)",
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

const HeaderCard = styled(Paper)(({ theme }) => ({
  background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
  color: "white",
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
}));

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.grey[400]}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(6),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  width: "100%",
  minHeight: "250px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
  boxSizing: "border-box",
  "&:hover": {
    borderColor: theme.palette.success.main,
    backgroundColor: "#f0fdf4",
  },
  "&.drag-active": {
    borderColor: theme.palette.success.main,
    backgroundColor: "#f0fdf4",
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  border: "1px solid #e5e7eb",
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "300px",
  borderRadius: theme.spacing(2),
  overflow: "hidden",
  border: "2px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f8fafc",
  position: "relative",
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #059669 0%, #00e4a4ff 100%)",
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.5, 4),
  fontSize: "1rem",
  fontWeight: 600,
  textTransform: "none",
  boxShadow: "0 4px 12px rgba(40, 183, 138, 0.58)",
  "&:hover": {
    background: "linear-gradient(135deg, #047857 0%, #065f46 100%)",
    boxShadow: "0 6px 16px rgba(5, 150, 105, 0.5)",
    transform: "translateY(-2px)",
  },
  "&:disabled": {
    background: theme.palette.grey[300],
    color: theme.palette.grey[500],
    boxShadow: "none",
  },
}));

// Icon wrapper component to make Lucide icons work with MUI
const IconWrapper = ({ children, ...props }) => (
  <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} {...props}>
    {children}
  </Box>
);

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setResult(null);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error uploading file:", error);
      setResult({
        prediction: "Error",
        explanation: "Failed to analyze the image. Please try again or check your connection."
      });
    }
    
    setLoading(false);
  };

  const isHealthy = result?.prediction?.toLowerCase().includes("healthy") || 
                   result?.prediction?.toLowerCase().includes("normal");
  const isError = result?.prediction === "Error";

  return (
    <StyledContainer maxWidth="xl">
      {/* Header */}
      <HeaderCard elevation={4}>
        <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
          <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", mr: 2, width: 56, height: 56 }}>
            <IconWrapper>
              <Leaf size={32} />
            </IconWrapper>
          </Avatar>
          <Typography variant="h3" component="h1" fontWeight="bold">
            Kiwi Leaf Disease Detector
          </Typography>
        </Box>
        <Typography variant="h6" textAlign="center" sx={{ opacity: 0.9 }}>
          AI-powered plant health analysis for kiwi cultivation
        </Typography>
      </HeaderCard>

      <Grid container spacing={4}>
        {/* Upload Section */}
        <Grid item xs={12} lg={4}>
          <StyledCard sx={{ width: "100%" }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: "#dcfce7", mr: 2 }}>
                  <IconWrapper>
                    <Camera size={24} color="#059669" />
                  </IconWrapper>
                </Avatar>
                <Typography variant="h5" fontWeight="600">
                  Upload Leaf Image
                </Typography>
              </Box>

              {/* Drag & Drop Area */}
              <UploadBox
                className={dragActive ? "drag-active" : ""}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <CloudUpload size={48} color="#9ca3af" style={{ marginBottom: 16 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, fontSize: "1.1rem" }}>
                  Drop your image here, or
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  size="medium"
                  sx={{ 
                    mt: 1, 
                    mb: 2, 
                    minWidth: 160,
                    borderColor: '#059669',
                    color: '#059669',
                    '&:hover': {
                      borderColor: '#047857',
                      backgroundColor: '#f0fdf4'
                    }
                  }}
                  startIcon={<Upload size={18} />}
                >
                  Browse Files
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    hidden
                  />
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Supports JPG, PNG, WEBP (max 10MB)
                </Typography>
              </UploadBox>

              {/* Selected File */}
              {file && (
                <Fade in={true}>
                  <Paper
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: "#f0fdf4",
                      border: 1,
                      borderColor: "#bbf7d0"
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: "#dcfce7", mr: 2 }}>
                        <IconWrapper>
                          <Leaf size={20} color="#059669" />
                        </IconWrapper>
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="500">
                          {file.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Fade>
              )}

              {/* Upload Button */}
              <GradientButton
                fullWidth
                onClick={handleUpload}
                disabled={!file || loading}
                sx={{ mt: 3 }}
                startIcon={loading ? null : <Eye size={20} />}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Leaf Health"
                )}
              </GradientButton>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Image Preview Section */}
        <Grid item xs={12} lg={4}>
          <StyledCard sx={{ width: "100%" }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: "#dcfce7", mr: 2 }}>
                  <IconWrapper>
                    <ImageIcon size={24} color="#059669" />
                  </IconWrapper>
                </Avatar>
                <Typography variant="h5" fontWeight="600">
                  Image Preview
                </Typography>
              </Box>

              <ImagePreview>
                {imagePreview ? (
                  <img src={imagePreview} alt="Uploaded leaf" />
                ) : (
                  <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                    <Avatar sx={{ bgcolor: "#f3f4f6", width: 64, height: 64, mb: 2 }}>
                      <IconWrapper>
                        <ImageIcon size={32} color="#9ca3af" />
                      </IconWrapper>
                    </Avatar>
                    <Typography variant="body1" color="text.secondary" textAlign="center">
                      No image selected
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Upload an image to see preview
                    </Typography>
                  </Box>
                )}
              </ImagePreview>

              {/* Image info */}
              {file && imagePreview && (
                <Fade in={true}>
                  <Paper
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: "#f8fafc",
                      border: 1,
                      borderColor: "#e2e8f0"
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Image Details
                    </Typography>
                    <Typography variant="body2">
                      <strong>Name:</strong> {file.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                    <Typography variant="body2">
                      <strong>Type:</strong> {file.type}
                    </Typography>
                  </Paper>
                </Fade>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} lg={4}>
          <StyledCard sx={{ minHeight: 400 }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: "#dcfce7", mr: 2 }}>
                  <IconWrapper>
                    <CheckCircle size={20} color="#059669" />
                  </IconWrapper>
                </Avatar>
                <Typography variant="h5" fontWeight="600">
                  Analysis Results
                </Typography>
              </Box>

              {loading ? (
                <Box display="flex" flexDirection="column" alignItems="center" py={6}>
                  <CircularProgress size={64} thickness={4} sx={{ mb: 3, color: "#059669" }} />
                  <Typography variant="h6" gutterBottom>
                    Analyzing leaf health...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This may take a few seconds
                  </Typography>
                </Box>
              ) : result ? (
                <Box>
                  {/* Prediction Chip */}
                  <Box mb={3} display="flex" justifyContent="center">
                    <Chip
                      icon={
                        <IconWrapper>
                          {isHealthy ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                        </IconWrapper>
                      }
                      label={result.prediction}
                      sx={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        px: 2,
                        py: 1,
                        height: "auto",
                        backgroundColor: isHealthy ? "#dcfce7" : isError ? "#f3f4f6" : "#fecaca",
                        color: isHealthy ? "#059669" : isError ? "#6b7280" : "#dc2626",
                        border: 1,
                        borderColor: isHealthy ? "#bbf7d0" : isError ? "#d1d5db" : "#fca5a5",
                      }}
                    />
                  </Box>

                  {/* Explanation Toggle */}
                  <Box display="flex" justifyContent="center" mb={2}>
                    <Button
                      onClick={() => setShowExplanation(!showExplanation)}
                      startIcon={<Eye size={16} />}
                      sx={{ mb: 2, textTransform: "none", color: "#059669" }}
                    >
                      {showExplanation ? "Hide" : "View"} Detailed Explanation
                    </Button>
                  </Box>

                  {/* Explanation Content */}
                  <Collapse in={showExplanation}>
                    <Paper
                      sx={{
                        p: 3,
                        bgcolor: "#f0fdf4",
                        border: 1,
                        borderColor: "#bbf7d0"
                      }}
                    >
                      <MarkdownRenderer content={result.explanation} />
                    </Paper>
                  </Collapse>
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" alignItems="center" py={6}>
                  <Avatar sx={{ bgcolor: "#f3f4f6", width: 72, height: 72, mb: 2 }}>
                    <IconWrapper>
                      <Leaf size={36} color="#9ca3af" />
                    </IconWrapper>
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    No analysis yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Upload a kiwi leaf image to get started with the health analysis
                  </Typography>
                </Box>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Info Card */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 4,
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              color: "white",
              borderRadius: 2
            }}
          >
            <Typography variant="h6" fontWeight="600" gutterBottom textAlign="center">
              How it works
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6, textAlign: "center", maxWidth: 800, mx: "auto" }}>
              Our AI model uses advanced computer vision to analyze leaf images and detect
              signs of disease, nutrient deficiencies, and pest damage. Get instant results
              with detailed explanations to help maintain healthy kiwi plants.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </StyledContainer>
  );
}