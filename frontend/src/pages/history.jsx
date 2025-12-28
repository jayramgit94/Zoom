import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import HomeIcon from "@mui/icons-material/Home";
import Container from "@mui/material/Container";
import { IconButton } from "@mui/material";

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const history = await getHistoryOfUser();
        console.log("History fetched:", history);
        setMeetings(history || []);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError(err.message || "Failed to fetch history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "20px",
      }}
    >
      <IconButton
        onClick={() => {
          routeTo("/home");
        }}
        style={{ marginBottom: "20px" }}
      >
        <HomeIcon />
      </IconButton>

      <Container maxWidth="md">
        <Typography
          variant="h4"
          component="h1"
          sx={{ mb: 3, fontWeight: "bold" }}
        >
          Meeting History
        </Typography>

        {loading ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ textAlign: "center", py: 3 }}
          >
            Loading history...
          </Typography>
        ) : error ? (
          <Card sx={{ backgroundColor: "#ffebee", p: 2 }}>
            <Typography color="error">Error: {error}</Typography>
          </Card>
        ) : meetings.length !== 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {meetings.map((meeting, i) => {
              return (
                <Card key={i} variant="outlined" sx={{ boxShadow: 2 }}>
                  <CardContent>
                    <Typography
                      sx={{ fontSize: 16, fontWeight: "bold" }}
                      color="primary"
                      gutterBottom
                    >
                      Meeting Code: {meeting.meetingCode}
                    </Typography>

                    <Typography
                      sx={{ mb: 1.5, fontSize: 14 }}
                      color="textSecondary"
                    >
                      Date: {formatDate(meeting.date)}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        ) : (
          <Card sx={{ p: 3, textAlign: "center", backgroundColor: "#e3f2fd" }}>
            <Typography variant="body1" color="textSecondary">
              No meeting history found. Start a new meeting to see it here!
            </Typography>
          </Card>
        )}
      </Container>
    </div>
  );
}
